<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface MarketPlugin {
  full_name: string
  name: string
  owner: string
  avatar: string
  description: string
  stars: number
  url: string
  branch: string
  topics: string[]
  manifest?: { name?: string; version?: string; description?: string }
  loadingManifest?: boolean
  installing?: boolean
  installed?: boolean
  error?: string
}

const TOPIC = '0kay-plugin'
const PER_PAGE = 12
const MAX_RESULTS = 1000
const plugins = ref<MarketPlugin[]>([])
const loading = ref(false)
const error = ref('')
const query = ref('')
const copied = ref('')
const page = ref(1)
const total = ref(0)
const installing = ref('')
const notice = ref('')
const installed = ref<Set<string>>(new Set())

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PER_PAGE)))
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)

function installTarget(item: MarketPlugin) {
  return item.manifest?.name || item.full_name
}

function installCommand(item: MarketPlugin) {
  return `0kay-pm install ${installTarget(item)}`
}

async function fetchManifest(full: string, branch: string) {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${full}/${branch}/manifest.json`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function enrich() {
  const queue = [...plugins.value]
  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const item = queue.shift()
      if (!item) break
      item.loadingManifest = true
      const manifest = await fetchManifest(item.full_name, item.branch)
      if (manifest) {
        item.manifest = { name: manifest.name, version: manifest.version, description: manifest.description }
      }
      item.loadingManifest = false
    }
  })
  await Promise.all(workers)
}

async function markInstalled() {
  try {
    const res = await fetch('/api/plugins/installed')
    if (!res.ok) return
    const data = await res.json()
    const set = new Set<string>(Array.isArray(data?.packages) ? data.packages : [])
    installed.value = set
    for (const item of plugins.value) {
      if (set.has(installTarget(item))) item.installed = true
    }
  } catch { /* older Core without the endpoint */ }
}

async function load(targetPage = 1) {
  loading.value = true
  error.value = ''
  copied.value = ''
  notice.value = ''
  const q = query.value.trim()
  const search = `topic:${TOPIC}` + (q ? ` ${q}` : '')
  try {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(search)}&sort=stars&order=desc&per_page=${PER_PAGE}&page=${targetPage}`,
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`)
    const data = await res.json()
    total.value = Math.min(data.total_count || 0, MAX_RESULTS)
    page.value = targetPage
    plugins.value = (data.items || []).map((repo: any) => ({
      full_name: repo.full_name,
      name: repo.name,
      owner: repo.owner?.login || '',
      avatar: repo.owner?.avatar_url || '',
      description: repo.description || '',
      stars: repo.stargazers_count || 0,
      url: repo.html_url,
      branch: repo.default_branch || 'main',
      topics: repo.topics || [],
    }))
    await enrich()
    await markInstalled()
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

function goto(target: number) {
  if (loading.value || target < 1 || target > totalPages.value) return
  load(target)
}

async function copyCommand(item: MarketPlugin) {
  try {
    await navigator.clipboard.writeText(installCommand(item))
    copied.value = item.full_name
    setTimeout(() => { if (copied.value === item.full_name) copied.value = '' }, 1500)
  } catch { /* clipboard unavailable */ }
}

async function waitForInstall(item: MarketPlugin) {
  for (let i = 0; i < 400; i++) {
    await new Promise((r) => setTimeout(r, 1500))
    const res = await fetch('/api/plugins/install/status')
    if (!res.ok) continue
    const state = await res.json()
    if (state.status === 'done') {
      item.installed = true
      notice.value = `已安装 ${installTarget(item)}，正在刷新…`
      await fetch('/api/ui/patches', { method: 'POST' })
      setTimeout(() => location.reload(), 1200)
      return
    }
    if (state.status === 'failed') throw new Error(state.error || '安装失败')
  }
  throw new Error('安装超时')
}

async function installPlugin(item: MarketPlugin) {
  if (installing.value || item.installed) return
  notice.value = ''
  item.error = ''
  item.installing = true
  installing.value = item.full_name
  try {
    const res = await fetch('/api/plugins/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package: installTarget(item) }),
    })
    if (res.status === 404) {
      await copyCommand(item)
      notice.value = '当前 Core 不支持一键安装，已复制安装命令'
      return
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    await waitForInstall(item)
  } catch (e: any) {
    item.error = e?.message || String(e)
  } finally {
    item.installing = false
    installing.value = ''
  }
}

onMounted(() => load(1))
</script>

<template>
  <div class="mp">
    <header class="mp-hero">
      <div>
        <p class="mp-eyebrow">0KAY MARKETPLACE</p>
        <h1>插件市场</h1>
        <p class="mp-sub">来自 GitHub topic <code>{{ TOPIC }}</code> 的 0KAY 插件，可直接一键安装。</p>
      </div>
      <div class="mp-actions">
        <input
          v-model="query"
          class="mp-search"
          type="search"
          placeholder="搜索插件…"
          aria-label="搜索插件"
          @keyup.enter="load(1)"
        />
        <button class="mp-btn" :disabled="loading" @click="load(1)">{{ loading ? '加载中…' : '搜索' }}</button>
        <button class="mp-btn tonal" :disabled="loading" @click="load(page)">刷新</button>
      </div>
    </header>

    <p v-if="error" class="mp-alert">{{ error }}</p>
    <p v-if="notice" class="mp-notice">{{ notice }}</p>

    <div v-if="loading && !plugins.length" class="mp-empty">正在从 GitHub 拉取插件…</div>
    <div v-else-if="!plugins.length" class="mp-empty">{{ query ? '没有匹配的插件' : '暂无插件' }}</div>

    <ul v-else class="mp-grid">
      <li v-for="item in plugins" :key="item.full_name" class="mp-card">
        <div class="mp-head">
          <img v-if="item.avatar" class="mp-avatar" :src="item.avatar" :alt="item.owner" loading="lazy" />
          <div class="mp-title">
            <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.full_name }}</a>
            <span class="mp-owner">{{ item.manifest?.name || item.name }}<template v-if="item.manifest?.version"> · v{{ item.manifest.version }}</template></span>
          </div>
          <span class="mp-stars" :title="`${item.stars} stars`">★ {{ item.stars }}</span>
        </div>

        <p class="mp-desc">{{ item.manifest?.description || item.description || '—' }}</p>

        <div v-if="item.topics.length" class="mp-chips">
          <span v-for="topic in item.topics.slice(0, 6)" :key="topic" class="mp-chip">{{ topic }}</span>
          <span v-if="item.topics.length > 6" class="mp-chip muted">+{{ item.topics.length - 6 }}</span>
        </div>

        <p v-if="item.error" class="mp-err">{{ item.error }}</p>

        <div class="mp-foot">
          <button
            v-if="!item.installed"
            class="mp-btn small install"
            :disabled="!!installing"
            @click="installPlugin(item)"
          >{{ item.installing ? '安装中…' : '安装' }}</button>
          <span v-else class="mp-installed">已安装</span>
          <button class="mp-btn small tonal" @click="copyCommand(item)">{{ copied === item.full_name ? '已复制' : '复制命令' }}</button>
          <a class="mp-btn small tonal" :href="item.url" target="_blank" rel="noopener noreferrer">打开</a>
        </div>
      </li>
    </ul>

    <nav v-if="plugins.length && !error" class="mp-pager">
      <button class="mp-btn small tonal" :disabled="!canPrev || loading" @click="goto(page - 1)">上一页</button>
      <span class="mp-count">第 {{ page }} / {{ totalPages }} 页 · 共 {{ total }} 个插件</span>
      <button class="mp-btn small tonal" :disabled="!canNext || loading" @click="goto(page + 1)">下一页</button>
    </nav>

    <p class="mp-note">一键安装会调用本机 Core 的 <code>/api/plugins/install</code>，由 <code>0kay-pm</code> 完成下载与构建；未登录的 GitHub 搜索接口每小时约 60 次。</p>
  </div>
</template>

<style scoped>
.mp { --code-font: ui-monospace, 'Cascadia Code', 'JetBrains Mono', Consolas, 'SFMono-Regular', Menlo, monospace; padding: clamp(20px, 2.6vw, 36px); max-width: 1100px; margin: 0 auto; }
.mp-hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 24px; }
.mp-eyebrow { margin: 0 0 6px; font-size: 12px; font-weight: 800; letter-spacing: .18em; color: var(--md-primary); }
.mp-hero h1 { margin: 0; font-size: clamp(26px, 3vw, 38px); font-weight: 850; letter-spacing: -.02em; }
.mp-sub { margin: 8px 0 0; color: var(--md-on-surface-variant); font-size: 15px; }
.mp-sub code, .mp-note code { font-family: var(--code-font); font-size: .9em; background: var(--md-surface-container-high); padding: 2px 6px; border-radius: 8px; }
.mp-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.mp-search { min-height: 44px; padding: 0 16px; min-width: 220px; border: 1px solid var(--md-outline-variant); border-radius: 999px; background: var(--md-surface-container-high); color: var(--md-on-surface); font: inherit; outline: none; }
.mp-search:focus { border-color: var(--md-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-primary) 14%, transparent); }
.mp-btn { min-height: 44px; padding: 0 20px; border: 0; border-radius: 999px; background: var(--md-primary); color: var(--md-on-primary); font: 700 14px/1 inherit; cursor: pointer; transition: transform .2s var(--ease-spring, ease), filter .15s; }
.mp-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
.mp-btn:disabled { opacity: .55; cursor: default; }
.mp-btn.tonal { background: var(--md-secondary-container); color: var(--md-on-secondary-container); }
.mp-btn.small { min-height: 34px; padding: 0 14px; font-size: 13px; }
.mp-btn.small.tonal { background: var(--md-secondary-container); color: var(--md-on-secondary-container); display: inline-flex; align-items: center; text-decoration: none; }
.mp-btn.small.install { background: var(--md-primary); color: var(--md-on-primary); }
.mp-installed { font-size: 13px; font-weight: 750; color: var(--md-primary); }
.mp-alert { padding: 12px 16px; border-radius: 16px; background: var(--md-error-container); color: #410e0b; font-size: 13px; }
.mp-notice { padding: 12px 16px; border-radius: 16px; background: var(--md-secondary-container); color: var(--md-on-secondary-container); font-size: 13px; }
.mp-err { margin: 0; font-size: 12px; color: #b3261e; }
.mp-empty { padding: 40px; text-align: center; color: var(--md-on-surface-variant); background: var(--md-surface-container-low); border-radius: 20px; }
.mp-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.mp-card { display: flex; flex-direction: column; gap: 12px; padding: 18px; border: 1px solid var(--md-outline-variant); border-radius: 24px 24px 24px 8px; background: var(--md-surface-container-low); transition: transform .24s var(--ease-spring, ease), box-shadow .24s, border-color .24s; }
.mp-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-2, 0 8px 24px rgba(20,18,36,.14)); border-color: color-mix(in srgb, var(--md-primary) 35%, var(--md-outline-variant)); }
.mp-head { display: flex; align-items: center; gap: 12px; }
.mp-avatar { width: 40px; height: 40px; border-radius: 14px; flex: none; }
.mp-title { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.mp-title a { color: var(--md-on-surface); font-weight: 750; font-size: 15px; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mp-title a:hover { color: var(--md-primary); text-decoration: underline; }
.mp-owner { color: var(--md-on-surface-variant); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mp-stars { flex: none; font-weight: 700; font-size: 12.5px; color: var(--md-primary); background: color-mix(in srgb, var(--md-primary) 12%, transparent); border-radius: 999px; padding: 4px 10px; }
.mp-desc { margin: 0; color: var(--md-on-surface-variant); font-size: 13.5px; line-height: 1.6; flex: 1; }
.mp-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.mp-chip { font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: var(--md-secondary-container); color: var(--md-on-secondary-container); }
.mp-chip.muted { background: var(--md-surface-container-high); color: var(--md-on-surface-variant); }
.mp-foot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mp-pager { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 26px; flex-wrap: wrap; }
.mp-count { color: var(--md-on-surface-variant); font-size: 13px; }
.mp-note { margin: 26px 0 0; color: var(--md-on-surface-variant); font-size: 12.5px; }
</style>
