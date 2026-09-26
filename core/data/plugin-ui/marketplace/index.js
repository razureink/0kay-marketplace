import { defineComponent as U, ref as u, computed as P, onMounted as B, openBlock as l, createElementBlock as o, createElementVNode as s, createTextVNode as h, toDisplayString as r, withDirectives as D, withKeys as F, vModelText as Y, createCommentVNode as v, Fragment as S, renderList as j } from "vue";
const J = { class: "mp" }, X = { class: "mp-hero" }, Q = { class: "mp-actions" }, W = ["disabled"], Z = ["disabled"], tt = {
  key: 0,
  class: "mp-alert"
}, et = {
  key: 1,
  class: "mp-notice"
}, at = {
  key: 2,
  class: "mp-empty"
}, st = {
  key: 3,
  class: "mp-empty"
}, nt = {
  key: 4,
  class: "mp-grid"
}, lt = { class: "mp-head" }, ot = ["src", "alt"], rt = { class: "mp-title" }, it = ["href"], ct = { class: "mp-owner" }, ut = ["title"], dt = { class: "mp-desc" }, pt = {
  key: 0,
  class: "mp-chips"
}, vt = {
  key: 0,
  class: "mp-chip muted"
}, ft = {
  key: 1,
  class: "mp-err"
}, mt = { class: "mp-foot" }, ht = ["disabled", "onClick"], _t = {
  key: 1,
  class: "mp-installed"
}, yt = ["onClick"], gt = ["href"], wt = {
  key: 5,
  class: "mp-pager"
}, kt = ["disabled"], bt = { class: "mp-count" }, $t = ["disabled"], x = "0kay-plugin", H = 12, Ct = 1e3, Tt = /* @__PURE__ */ U({
  __name: "MarketplacePage",
  setup($) {
    const d = u([]), c = u(!1), f = u(""), _ = u(""), g = u(""), m = u(1), C = u(0), k = u(""), y = u(""), N = u(/* @__PURE__ */ new Set()), R = u(/* @__PURE__ */ new Set());
    function A(a) {
      return String(a || "").replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "").replace(/\/+$/, "").toLowerCase();
    }
    const T = P(() => Math.max(1, Math.ceil(C.value / H))), G = P(() => m.value > 1), I = P(() => m.value < T.value);
    function b(a) {
      return a.manifest?.name || a.full_name;
    }
    function K(a) {
      return `0kay-pm install ${b(a)}`;
    }
    async function O(a, e) {
      try {
        const t = await fetch(`https://raw.githubusercontent.com/${a}/${e}/manifest.json`);
        return t.ok ? await t.json() : null;
      } catch {
        return null;
      }
    }
    async function q() {
      const a = [...d.value], e = Array.from({ length: 6 }, async () => {
        for (; a.length; ) {
          const t = a.shift();
          if (!t) break;
          t.loadingManifest = !0;
          const n = await O(t.full_name, t.branch);
          n && (t.manifest = { name: n.name, version: n.version, description: n.description }), t.loadingManifest = !1;
        }
      });
      await Promise.all(e);
    }
    async function L() {
      try {
        const a = await fetch("/api/plugins/installed");
        if (!a.ok) return;
        const e = await a.json(), t = new Set(Array.isArray(e?.packages) ? e.packages : []), n = /* @__PURE__ */ new Set();
        for (const i of Array.isArray(e?.installed) ? e.installed : [])
          i?.name && t.add(i.name), i?.repository && n.add(A(i.repository));
        N.value = t, R.value = n;
        for (const i of d.value)
          (t.has(b(i)) || n.has(A(i.url))) && (i.installed = !0);
      } catch {
      }
    }
    async function w(a = 1) {
      c.value = !0, f.value = "", g.value = "", y.value = "";
      const e = _.value.trim(), t = `topic:${x}` + (e ? ` ${e}` : "");
      try {
        const n = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(t)}&sort=stars&order=desc&per_page=${H}&page=${a}`,
          { headers: { Accept: "application/vnd.github+json" } }
        );
        if (!n.ok) throw new Error(`GitHub HTTP ${n.status}`);
        const i = await n.json();
        C.value = Math.min(i.total_count || 0, Ct), m.value = a, d.value = (i.items || []).map((p) => ({
          full_name: p.full_name,
          name: p.name,
          owner: p.owner?.login || "",
          avatar: p.owner?.avatar_url || "",
          description: p.description || "",
          stars: p.stargazers_count || 0,
          url: p.html_url,
          branch: p.default_branch || "main",
          topics: p.topics || []
        })), await q(), await L();
      } catch (n) {
        f.value = n?.message || String(n);
      } finally {
        c.value = !1;
      }
    }
    function M(a) {
      c.value || a < 1 || a > T.value || w(a);
    }
    async function E(a) {
      try {
        await navigator.clipboard.writeText(K(a)), g.value = a.full_name, setTimeout(() => {
          g.value === a.full_name && (g.value = "");
        }, 1500);
      } catch {
      }
    }
    async function V(a) {
      for (let e = 0; e < 400; e++) {
        await new Promise((i) => setTimeout(i, 1500));
        const t = await fetch("/api/plugins/install/status");
        if (!t.ok) continue;
        const n = await t.json();
        if (n.status === "done") {
          a.installed = !0, y.value = `已安装 ${b(a)}，正在刷新…`, await fetch("/api/ui/patches", { method: "POST" }), setTimeout(() => location.reload(), 1200);
          return;
        }
        if (n.status === "failed") throw new Error(n.error || "安装失败");
      }
      throw new Error("安装超时");
    }
    async function z(a) {
      if (!(k.value || a.installed)) {
        y.value = "", a.error = "", a.installing = !0, k.value = a.full_name;
        try {
          const e = await fetch("/api/plugins/install", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ package: b(a) })
          });
          if (e.status === 404) {
            await E(a), y.value = "当前 Core 不支持一键安装，已复制安装命令";
            return;
          }
          const t = await e.json().catch(() => ({}));
          if (!e.ok) throw new Error(t.error || `HTTP ${e.status}`);
          await V(a);
        } catch (e) {
          a.error = e?.message || String(e);
        } finally {
          a.installing = !1, k.value = "";
        }
      }
    }
    return B(() => w(1)), (a, e) => (l(), o("div", J, [
      s("header", X, [
        s("div", null, [
          e[8] || (e[8] = s("p", { class: "mp-eyebrow" }, "0KAY MARKETPLACE", -1)),
          e[9] || (e[9] = s("h1", null, "插件市场", -1)),
          s("p", { class: "mp-sub" }, [
            e[6] || (e[6] = h("来自 GitHub topic ", -1)),
            s("code", null, r(x)),
            e[7] || (e[7] = h(" 的 0KAY 插件，可直接一键安装。", -1))
          ])
        ]),
        s("div", Q, [
          D(s("input", {
            "onUpdate:modelValue": e[0] || (e[0] = (t) => _.value = t),
            class: "mp-search",
            type: "search",
            placeholder: "搜索插件…",
            "aria-label": "搜索插件",
            onKeyup: e[1] || (e[1] = F((t) => w(1), ["enter"]))
          }, null, 544), [
            [Y, _.value]
          ]),
          s("button", {
            class: "mp-btn",
            disabled: c.value,
            onClick: e[2] || (e[2] = (t) => w(1))
          }, r(c.value ? "加载中…" : "搜索"), 9, W),
          s("button", {
            class: "mp-btn tonal",
            disabled: c.value,
            onClick: e[3] || (e[3] = (t) => w(m.value))
          }, "刷新", 8, Z)
        ])
      ]),
      f.value ? (l(), o("p", tt, r(f.value), 1)) : v("", !0),
      y.value ? (l(), o("p", et, r(y.value), 1)) : v("", !0),
      c.value && !d.value.length ? (l(), o("div", at, "正在从 GitHub 拉取插件…")) : d.value.length ? (l(), o("ul", nt, [
        (l(!0), o(S, null, j(d.value, (t) => (l(), o("li", {
          key: t.full_name,
          class: "mp-card"
        }, [
          s("div", lt, [
            t.avatar ? (l(), o("img", {
              key: 0,
              class: "mp-avatar",
              src: t.avatar,
              alt: t.owner,
              loading: "lazy"
            }, null, 8, ot)) : v("", !0),
            s("div", rt, [
              s("a", {
                href: t.url,
                target: "_blank",
                rel: "noopener noreferrer"
              }, r(t.full_name), 9, it),
              s("span", ct, [
                h(r(t.manifest?.name || t.name), 1),
                t.manifest?.version ? (l(), o(S, { key: 0 }, [
                  h(" · v" + r(t.manifest.version), 1)
                ], 64)) : v("", !0)
              ])
            ]),
            s("span", {
              class: "mp-stars",
              title: `${t.stars} stars`
            }, "★ " + r(t.stars), 9, ut)
          ]),
          s("p", dt, r(t.manifest?.description || t.description || "—"), 1),
          t.topics.length ? (l(), o("div", pt, [
            (l(!0), o(S, null, j(t.topics.slice(0, 6), (n) => (l(), o("span", {
              key: n,
              class: "mp-chip"
            }, r(n), 1))), 128)),
            t.topics.length > 6 ? (l(), o("span", vt, "+" + r(t.topics.length - 6), 1)) : v("", !0)
          ])) : v("", !0),
          t.error ? (l(), o("p", ft, r(t.error), 1)) : v("", !0),
          s("div", mt, [
            t.installed ? (l(), o("span", _t, "已安装")) : (l(), o("button", {
              key: 0,
              class: "mp-btn small install",
              disabled: !!k.value,
              onClick: (n) => z(t)
            }, r(t.installing ? "安装中…" : "安装"), 9, ht)),
            s("button", {
              class: "mp-btn small tonal",
              onClick: (n) => E(t)
            }, r(g.value === t.full_name ? "已复制" : "复制命令"), 9, yt),
            s("a", {
              class: "mp-btn small tonal",
              href: t.url,
              target: "_blank",
              rel: "noopener noreferrer"
            }, "打开", 8, gt)
          ])
        ]))), 128))
      ])) : (l(), o("div", st, r(_.value ? "没有匹配的插件" : "暂无插件"), 1)),
      d.value.length && !f.value ? (l(), o("nav", wt, [
        s("button", {
          class: "mp-btn small tonal",
          disabled: !G.value || c.value,
          onClick: e[4] || (e[4] = (t) => M(m.value - 1))
        }, "上一页", 8, kt),
        s("span", bt, "第 " + r(m.value) + " / " + r(T.value) + " 页 · 共 " + r(C.value) + " 个插件", 1),
        s("button", {
          class: "mp-btn small tonal",
          disabled: !I.value || c.value,
          onClick: e[5] || (e[5] = (t) => M(m.value + 1))
        }, "下一页", 8, $t)
      ])) : v("", !0),
      e[10] || (e[10] = s("p", { class: "mp-note" }, [
        h("一键安装会调用本机 Core 的 "),
        s("code", null, "/api/plugins/install"),
        h("，由 "),
        s("code", null, "0kay-pm"),
        h(" 完成下载与构建；未登录的 GitHub 搜索接口每小时约 60 次。")
      ], -1))
    ]));
  }
}), Pt = ($, d) => {
  const c = $.__vccOpts || $;
  for (const [f, _] of d)
    c[f] = _;
  return c;
}, At = /* @__PURE__ */ Pt(Tt, [["__scopeId", "data-v-21912511"]]);
export {
  At as default
};

;(()=>{if(typeof document!=='undefined'&&!document.getElementById('marketplace-plugin-style')){const s=document.createElement('style');s.id='marketplace-plugin-style';s.textContent=".mp[data-v-21912511]{--code-font: ui-monospace, \"Cascadia Code\", \"JetBrains Mono\", Consolas, \"SFMono-Regular\", Menlo, monospace;box-sizing:border-box;flex:1;min-height:0;width:100%;overflow-y:auto;overscroll-behavior:contain;padding:clamp(20px,2.6vw,36px) max(clamp(20px,2.6vw,36px),calc((100% - 1100px)/2))}.mp-hero[data-v-21912511]{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px}.mp-eyebrow[data-v-21912511]{margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.18em;color:var(--md-primary)}.mp-hero h1[data-v-21912511]{margin:0;font-size:clamp(26px,3vw,38px);font-weight:850;letter-spacing:-.02em}.mp-sub[data-v-21912511]{margin:8px 0 0;color:var(--md-on-surface-variant);font-size:15px}.mp-sub code[data-v-21912511],.mp-note code[data-v-21912511]{font-family:var(--code-font);font-size:.9em;background:var(--md-surface-container-high);padding:2px 6px;border-radius:8px}.mp-actions[data-v-21912511]{display:flex;gap:10px;flex-wrap:wrap}.mp-search[data-v-21912511]{min-height:44px;padding:0 16px;min-width:220px;border:1px solid var(--md-outline-variant);border-radius:999px;background:var(--md-surface-container-high);color:var(--md-on-surface);font:inherit;outline:none}.mp-search[data-v-21912511]:focus{border-color:var(--md-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--md-primary) 14%,transparent)}.mp-btn[data-v-21912511]{min-height:44px;padding:0 20px;border:0;border-radius:999px;background:var(--md-primary);color:var(--md-on-primary);font:700 14px/1 inherit;cursor:pointer;transition:transform .2s var(--ease-spring, ease),filter .15s}.mp-btn[data-v-21912511]:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.05)}.mp-btn[data-v-21912511]:disabled{opacity:.55;cursor:default}.mp-btn.tonal[data-v-21912511]{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}.mp-btn.small[data-v-21912511]{min-height:34px;padding:0 14px;font-size:13px}.mp-btn.small.tonal[data-v-21912511]{background:var(--md-secondary-container);color:var(--md-on-secondary-container);display:inline-flex;align-items:center;text-decoration:none}.mp-btn.small.install[data-v-21912511]{background:var(--md-primary);color:var(--md-on-primary)}.mp-installed[data-v-21912511]{font-size:13px;font-weight:750;color:var(--md-primary)}.mp-alert[data-v-21912511]{padding:12px 16px;border-radius:16px;background:var(--md-error-container);color:#410e0b;font-size:13px}.mp-notice[data-v-21912511]{padding:12px 16px;border-radius:16px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);font-size:13px}.mp-err[data-v-21912511]{margin:0;font-size:12px;color:#b3261e}.mp-empty[data-v-21912511]{padding:40px;text-align:center;color:var(--md-on-surface-variant);background:var(--md-surface-container-low);border-radius:20px}.mp-grid[data-v-21912511]{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}.mp-card[data-v-21912511]{display:flex;flex-direction:column;gap:12px;padding:18px;border:1px solid var(--md-outline-variant);border-radius:24px 24px 24px 8px;background:var(--md-surface-container-low);transition:transform .24s var(--ease-spring, ease),box-shadow .24s,border-color .24s}.mp-card[data-v-21912511]:hover{transform:translateY(-3px);box-shadow:var(--shadow-2, 0 8px 24px rgba(20,18,36,.14));border-color:color-mix(in srgb,var(--md-primary) 35%,var(--md-outline-variant))}.mp-head[data-v-21912511]{display:flex;align-items:center;gap:12px}.mp-avatar[data-v-21912511]{width:40px;height:40px;border-radius:14px;flex:none}.mp-title[data-v-21912511]{display:flex;flex-direction:column;min-width:0;flex:1}.mp-title a[data-v-21912511]{color:var(--md-on-surface);font-weight:750;font-size:15px;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-title a[data-v-21912511]:hover{color:var(--md-primary);text-decoration:underline}.mp-owner[data-v-21912511]{color:var(--md-on-surface-variant);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-stars[data-v-21912511]{flex:none;font-weight:700;font-size:12.5px;color:var(--md-primary);background:color-mix(in srgb,var(--md-primary) 12%,transparent);border-radius:999px;padding:4px 10px}.mp-desc[data-v-21912511]{margin:0;color:var(--md-on-surface-variant);font-size:13.5px;line-height:1.6;flex:1}.mp-chips[data-v-21912511]{display:flex;flex-wrap:wrap;gap:6px}.mp-chip[data-v-21912511]{font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:999px;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}.mp-chip.muted[data-v-21912511]{background:var(--md-surface-container-high);color:var(--md-on-surface-variant)}.mp-foot[data-v-21912511]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mp-pager[data-v-21912511]{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:26px;flex-wrap:wrap}.mp-count[data-v-21912511]{color:var(--md-on-surface-variant);font-size:13px}.mp-note[data-v-21912511]{margin:26px 0 0;color:var(--md-on-surface-variant);font-size:12.5px}\n";document.head.appendChild(s)}})();
