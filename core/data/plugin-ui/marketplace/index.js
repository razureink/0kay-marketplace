import { defineComponent as T, ref as f, onMounted as x, computed as A, openBlock as n, createElementBlock as l, createElementVNode as a, createTextVNode as d, toDisplayString as o, withDirectives as P, vModelText as E, createCommentVNode as _, Fragment as y, renderList as b } from "vue";
const H = { class: "mp" }, j = { class: "mp-hero" }, q = { class: "mp-actions" }, G = ["disabled"], L = {
  key: 0,
  class: "mp-alert"
}, V = {
  key: 1,
  class: "mp-empty"
}, K = {
  key: 2,
  class: "mp-empty"
}, N = {
  key: 3,
  class: "mp-grid"
}, z = { class: "mp-head" }, B = ["src", "alt"], D = { class: "mp-title" }, I = ["href"], O = { class: "mp-owner" }, S = ["title"], Y = { class: "mp-desc" }, F = {
  key: 0,
  class: "mp-chips"
}, R = {
  key: 0,
  class: "mp-chip muted"
}, U = { class: "mp-foot" }, J = ["title"], Q = ["onClick"], W = ["href"], w = "0kay-plugin", X = /* @__PURE__ */ T({
  __name: "MarketplacePage",
  setup(h) {
    const i = f([]), r = f(!1), u = f(""), p = f(""), m = f("");
    async function $(t, s) {
      try {
        const e = await fetch(`https://raw.githubusercontent.com/${t}/${s}/manifest.json`);
        return e.ok ? await e.json() : null;
      } catch {
        return null;
      }
    }
    async function C() {
      const t = [...i.value], s = Array.from({ length: 6 }, async () => {
        for (; t.length; ) {
          const e = t.shift();
          if (!e) break;
          e.loadingManifest = !0;
          const c = await $(e.full_name, e.branch);
          c && (e.manifest = { name: c.name, version: c.version, description: c.description }), e.loadingManifest = !1;
        }
      });
      await Promise.all(s);
    }
    async function g() {
      r.value = !0, u.value = "", m.value = "";
      try {
        const t = await fetch(
          `https://api.github.com/search/repositories?q=topic:${w}&sort=stars&order=desc&per_page=100`,
          { headers: { Accept: "application/vnd.github+json" } }
        );
        if (!t.ok) throw new Error(`GitHub HTTP ${t.status}`);
        const s = await t.json();
        i.value = (s.items || []).map((e) => ({
          full_name: e.full_name,
          name: e.name,
          owner: e.owner?.login || "",
          avatar: e.owner?.avatar_url || "",
          description: e.description || "",
          stars: e.stargazers_count || 0,
          url: e.html_url,
          branch: e.default_branch || "main",
          topics: e.topics || []
        })), await C();
      } catch (t) {
        u.value = t?.message || String(t);
      } finally {
        r.value = !1;
      }
    }
    x(g);
    function v(t) {
      return t.manifest?.name ? `0kay-pm install ${t.manifest.name}` : `0kay-pm install ${t.full_name}`;
    }
    async function M(t) {
      try {
        await navigator.clipboard.writeText(v(t)), m.value = t.full_name, setTimeout(() => {
          m.value === t.full_name && (m.value = "");
        }, 1500);
      } catch {
      }
    }
    const k = A(() => {
      const t = p.value.trim().toLowerCase();
      return t ? i.value.filter(
        (s) => `${s.full_name} ${s.description} ${s.manifest?.name || ""} ${s.manifest?.version || ""}`.toLowerCase().includes(t)
      ) : i.value;
    });
    return (t, s) => (n(), l("div", H, [
      a("header", j, [
        a("div", null, [
          s[3] || (s[3] = a("p", { class: "mp-eyebrow" }, "0KAY MARKETPLACE", -1)),
          s[4] || (s[4] = a("h1", null, "插件市场", -1)),
          a("p", { class: "mp-sub" }, [
            s[1] || (s[1] = d("来自 GitHub topic ", -1)),
            a("code", null, o(w)),
            s[2] || (s[2] = d(" 的 0KAY 插件。", -1))
          ])
        ]),
        a("div", q, [
          P(a("input", {
            "onUpdate:modelValue": s[0] || (s[0] = (e) => p.value = e),
            class: "mp-search",
            type: "search",
            placeholder: "搜索插件…",
            "aria-label": "搜索插件"
          }, null, 512), [
            [E, p.value]
          ]),
          a("button", {
            class: "mp-btn",
            disabled: r.value,
            onClick: g
          }, o(r.value ? "加载中…" : "刷新"), 9, G)
        ])
      ]),
      u.value ? (n(), l("p", L, o(u.value), 1)) : _("", !0),
      r.value && !i.value.length ? (n(), l("div", V, "正在从 GitHub 拉取插件…")) : k.value.length ? (n(), l("ul", N, [
        (n(!0), l(y, null, b(k.value, (e) => (n(), l("li", {
          key: e.full_name,
          class: "mp-card"
        }, [
          a("div", z, [
            e.avatar ? (n(), l("img", {
              key: 0,
              class: "mp-avatar",
              src: e.avatar,
              alt: e.owner,
              loading: "lazy"
            }, null, 8, B)) : _("", !0),
            a("div", D, [
              a("a", {
                href: e.url,
                target: "_blank",
                rel: "noopener noreferrer"
              }, o(e.full_name), 9, I),
              a("span", O, [
                d(o(e.manifest?.name || e.name), 1),
                e.manifest?.version ? (n(), l(y, { key: 0 }, [
                  d(" · v" + o(e.manifest.version), 1)
                ], 64)) : _("", !0)
              ])
            ]),
            a("span", {
              class: "mp-stars",
              title: `${e.stars} stars`
            }, "★ " + o(e.stars), 9, S)
          ]),
          a("p", Y, o(e.manifest?.description || e.description || "—"), 1),
          e.topics.length ? (n(), l("div", F, [
            (n(!0), l(y, null, b(e.topics.slice(0, 6), (c) => (n(), l("span", {
              key: c,
              class: "mp-chip"
            }, o(c), 1))), 128)),
            e.topics.length > 6 ? (n(), l("span", R, "+" + o(e.topics.length - 6), 1)) : _("", !0)
          ])) : _("", !0),
          a("div", U, [
            a("code", {
              class: "mp-cmd",
              title: v(e)
            }, o(v(e)), 9, J),
            a("button", {
              class: "mp-btn small",
              onClick: (c) => M(e)
            }, o(m.value === e.full_name ? "已复制" : "复制"), 9, Q),
            a("a", {
              class: "mp-btn small tonal",
              href: e.url,
              target: "_blank",
              rel: "noopener noreferrer"
            }, "打开", 8, W)
          ])
        ]))), 128))
      ])) : (n(), l("div", K, o(p.value ? "没有匹配的插件" : "暂无插件"), 1)),
      s[5] || (s[5] = a("p", { class: "mp-note" }, [
        d("未登录的 GitHub 搜索接口每小时约 60 次；安装命令需在本机用 "),
        a("code", null, "0kay-pm"),
        d(" 执行。")
      ], -1))
    ]));
  }
}), Z = (h, i) => {
  const r = h.__vccOpts || h;
  for (const [u, p] of i)
    r[u] = p;
  return r;
}, te = /* @__PURE__ */ Z(X, [["__scopeId", "data-v-5a29ff98"]]);
export {
  te as default
};

;(()=>{if(typeof document!=='undefined'&&!document.getElementById('marketplace-plugin-style')){const s=document.createElement('style');s.id='marketplace-plugin-style';s.textContent=".mp[data-v-5a29ff98]{--code-font: ui-monospace, \"Cascadia Code\", \"JetBrains Mono\", Consolas, \"SFMono-Regular\", Menlo, monospace;padding:clamp(20px,2.6vw,36px);max-width:1100px;margin:0 auto}.mp-hero[data-v-5a29ff98]{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px}.mp-eyebrow[data-v-5a29ff98]{margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.18em;color:var(--md-primary)}.mp-hero h1[data-v-5a29ff98]{margin:0;font-size:clamp(26px,3vw,38px);font-weight:850;letter-spacing:-.02em}.mp-sub[data-v-5a29ff98]{margin:8px 0 0;color:var(--md-on-surface-variant);font-size:15px}.mp-sub code[data-v-5a29ff98],.mp-note code[data-v-5a29ff98]{font-family:var(--code-font);font-size:.9em;background:var(--md-surface-container-high);padding:2px 6px;border-radius:8px}.mp-actions[data-v-5a29ff98]{display:flex;gap:10px;flex-wrap:wrap}.mp-search[data-v-5a29ff98]{min-height:44px;padding:0 16px;min-width:220px;border:1px solid var(--md-outline-variant);border-radius:999px;background:var(--md-surface-container-high);color:var(--md-on-surface);font:inherit;outline:none}.mp-search[data-v-5a29ff98]:focus{border-color:var(--md-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--md-primary) 14%,transparent)}.mp-btn[data-v-5a29ff98]{min-height:44px;padding:0 20px;border:0;border-radius:999px;background:var(--md-primary);color:var(--md-on-primary);font:700 14px/1 inherit;cursor:pointer;transition:transform .2s var(--ease-spring, ease),filter .15s}.mp-btn[data-v-5a29ff98]:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.05)}.mp-btn[data-v-5a29ff98]:disabled{opacity:.55;cursor:default}.mp-btn.small[data-v-5a29ff98]{min-height:34px;padding:0 14px;font-size:13px}.mp-btn.small.tonal[data-v-5a29ff98]{background:var(--md-secondary-container);color:var(--md-on-secondary-container);display:inline-flex;align-items:center;text-decoration:none}.mp-alert[data-v-5a29ff98]{padding:12px 16px;border-radius:16px;background:var(--md-error-container);color:#410e0b;font-size:13px}.mp-empty[data-v-5a29ff98]{padding:40px;text-align:center;color:var(--md-on-surface-variant);background:var(--md-surface-container-low);border-radius:20px}.mp-grid[data-v-5a29ff98]{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}.mp-card[data-v-5a29ff98]{display:flex;flex-direction:column;gap:12px;padding:18px;border:1px solid var(--md-outline-variant);border-radius:24px 24px 24px 8px;background:var(--md-surface-container-low);transition:transform .24s var(--ease-spring, ease),box-shadow .24s,border-color .24s}.mp-card[data-v-5a29ff98]:hover{transform:translateY(-3px);box-shadow:var(--shadow-2, 0 8px 24px rgba(20,18,36,.14));border-color:color-mix(in srgb,var(--md-primary) 35%,var(--md-outline-variant))}.mp-head[data-v-5a29ff98]{display:flex;align-items:center;gap:12px}.mp-avatar[data-v-5a29ff98]{width:40px;height:40px;border-radius:14px;flex:none}.mp-title[data-v-5a29ff98]{display:flex;flex-direction:column;min-width:0;flex:1}.mp-title a[data-v-5a29ff98]{color:var(--md-on-surface);font-weight:750;font-size:15px;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-title a[data-v-5a29ff98]:hover{color:var(--md-primary);text-decoration:underline}.mp-owner[data-v-5a29ff98]{color:var(--md-on-surface-variant);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-stars[data-v-5a29ff98]{flex:none;font-weight:700;font-size:12.5px;color:var(--md-primary);background:color-mix(in srgb,var(--md-primary) 12%,transparent);border-radius:999px;padding:4px 10px}.mp-desc[data-v-5a29ff98]{margin:0;color:var(--md-on-surface-variant);font-size:13.5px;line-height:1.6;flex:1}.mp-chips[data-v-5a29ff98]{display:flex;flex-wrap:wrap;gap:6px}.mp-chip[data-v-5a29ff98]{font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:999px;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}.mp-chip.muted[data-v-5a29ff98]{background:var(--md-surface-container-high);color:var(--md-on-surface-variant)}.mp-foot[data-v-5a29ff98]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mp-cmd[data-v-5a29ff98]{flex:1;min-width:0;font-family:var(--code-font);font-size:12px;background:var(--md-surface-container-highest);padding:8px 12px;border-radius:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-note[data-v-5a29ff98]{margin:26px 0 0;color:var(--md-on-surface-variant);font-size:12.5px}\n";document.head.appendChild(s)}})();
