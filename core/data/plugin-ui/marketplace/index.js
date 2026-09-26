import { defineComponent as L, ref as c, computed as P, onMounted as U, openBlock as l, createElementBlock as o, createElementVNode as s, createTextVNode as h, toDisplayString as r, withDirectives as z, withKeys as B, vModelText as D, createCommentVNode as p, Fragment as M, renderList as S } from "vue";
const F = { class: "mp" }, Y = { class: "mp-hero" }, J = { class: "mp-actions" }, X = ["disabled"], Q = ["disabled"], W = {
  key: 0,
  class: "mp-alert"
}, Z = {
  key: 1,
  class: "mp-notice"
}, tt = {
  key: 2,
  class: "mp-empty"
}, at = {
  key: 3,
  class: "mp-empty"
}, et = {
  key: 4,
  class: "mp-grid"
}, st = { class: "mp-head" }, nt = ["src", "alt"], lt = { class: "mp-title" }, ot = ["href"], rt = { class: "mp-owner" }, it = ["title"], ct = { class: "mp-desc" }, ut = {
  key: 0,
  class: "mp-chips"
}, dt = {
  key: 0,
  class: "mp-chip muted"
}, pt = {
  key: 1,
  class: "mp-err"
}, vt = { class: "mp-foot" }, ft = ["disabled", "onClick"], ht = {
  key: 1,
  class: "mp-installed"
}, mt = ["onClick"], _t = ["href"], yt = {
  key: 5,
  class: "mp-pager"
}, gt = ["disabled"], kt = { class: "mp-count" }, wt = ["disabled"], j = "0kay-plugin", x = 12, bt = 1e3, $t = /* @__PURE__ */ L({
  __name: "MarketplacePage",
  setup($) {
    const u = c([]), i = c(!1), v = c(""), m = c(""), y = c(""), f = c(1), C = c(0), k = c(""), _ = c(""), H = c(/* @__PURE__ */ new Set()), T = P(() => Math.max(1, Math.ceil(C.value / x))), G = P(() => f.value > 1), I = P(() => f.value < T.value);
    function w(e) {
      return e.manifest?.name || e.full_name;
    }
    function K(e) {
      return `0kay-pm install ${w(e)}`;
    }
    async function N(e, a) {
      try {
        const t = await fetch(`https://raw.githubusercontent.com/${e}/${a}/manifest.json`);
        return t.ok ? await t.json() : null;
      } catch {
        return null;
      }
    }
    async function O() {
      const e = [...u.value], a = Array.from({ length: 6 }, async () => {
        for (; e.length; ) {
          const t = e.shift();
          if (!t) break;
          t.loadingManifest = !0;
          const n = await N(t.full_name, t.branch);
          n && (t.manifest = { name: n.name, version: n.version, description: n.description }), t.loadingManifest = !1;
        }
      });
      await Promise.all(a);
    }
    async function q() {
      try {
        const e = await fetch("/api/plugins/installed");
        if (!e.ok) return;
        const a = await e.json(), t = new Set(Array.isArray(a?.packages) ? a.packages : []);
        H.value = t;
        for (const n of u.value)
          t.has(w(n)) && (n.installed = !0);
      } catch {
      }
    }
    async function g(e = 1) {
      i.value = !0, v.value = "", y.value = "", _.value = "";
      const a = m.value.trim(), t = `topic:${j}` + (a ? ` ${a}` : "");
      try {
        const n = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(t)}&sort=stars&order=desc&per_page=${x}&page=${e}`,
          { headers: { Accept: "application/vnd.github+json" } }
        );
        if (!n.ok) throw new Error(`GitHub HTTP ${n.status}`);
        const b = await n.json();
        C.value = Math.min(b.total_count || 0, bt), f.value = e, u.value = (b.items || []).map((d) => ({
          full_name: d.full_name,
          name: d.name,
          owner: d.owner?.login || "",
          avatar: d.owner?.avatar_url || "",
          description: d.description || "",
          stars: d.stargazers_count || 0,
          url: d.html_url,
          branch: d.default_branch || "main",
          topics: d.topics || []
        })), await O(), await q();
      } catch (n) {
        v.value = n?.message || String(n);
      } finally {
        i.value = !1;
      }
    }
    function E(e) {
      i.value || e < 1 || e > T.value || g(e);
    }
    async function A(e) {
      try {
        await navigator.clipboard.writeText(K(e)), y.value = e.full_name, setTimeout(() => {
          y.value === e.full_name && (y.value = "");
        }, 1500);
      } catch {
      }
    }
    async function R(e) {
      for (let a = 0; a < 400; a++) {
        await new Promise((b) => setTimeout(b, 1500));
        const t = await fetch("/api/plugins/install/status");
        if (!t.ok) continue;
        const n = await t.json();
        if (n.status === "done") {
          e.installed = !0, _.value = `已安装 ${w(e)}，正在刷新…`, await fetch("/api/ui/patches", { method: "POST" }), setTimeout(() => location.reload(), 1200);
          return;
        }
        if (n.status === "failed") throw new Error(n.error || "安装失败");
      }
      throw new Error("安装超时");
    }
    async function V(e) {
      if (!(k.value || e.installed)) {
        _.value = "", e.error = "", e.installing = !0, k.value = e.full_name;
        try {
          const a = await fetch("/api/plugins/install", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ package: w(e) })
          });
          if (a.status === 404) {
            await A(e), _.value = "当前 Core 不支持一键安装，已复制安装命令";
            return;
          }
          const t = await a.json().catch(() => ({}));
          if (!a.ok) throw new Error(t.error || `HTTP ${a.status}`);
          await R(e);
        } catch (a) {
          e.error = a?.message || String(a);
        } finally {
          e.installing = !1, k.value = "";
        }
      }
    }
    return U(() => g(1)), (e, a) => (l(), o("div", F, [
      s("header", Y, [
        s("div", null, [
          a[8] || (a[8] = s("p", { class: "mp-eyebrow" }, "0KAY MARKETPLACE", -1)),
          a[9] || (a[9] = s("h1", null, "插件市场", -1)),
          s("p", { class: "mp-sub" }, [
            a[6] || (a[6] = h("来自 GitHub topic ", -1)),
            s("code", null, r(j)),
            a[7] || (a[7] = h(" 的 0KAY 插件，可直接一键安装。", -1))
          ])
        ]),
        s("div", J, [
          z(s("input", {
            "onUpdate:modelValue": a[0] || (a[0] = (t) => m.value = t),
            class: "mp-search",
            type: "search",
            placeholder: "搜索插件…",
            "aria-label": "搜索插件",
            onKeyup: a[1] || (a[1] = B((t) => g(1), ["enter"]))
          }, null, 544), [
            [D, m.value]
          ]),
          s("button", {
            class: "mp-btn",
            disabled: i.value,
            onClick: a[2] || (a[2] = (t) => g(1))
          }, r(i.value ? "加载中…" : "搜索"), 9, X),
          s("button", {
            class: "mp-btn tonal",
            disabled: i.value,
            onClick: a[3] || (a[3] = (t) => g(f.value))
          }, "刷新", 8, Q)
        ])
      ]),
      v.value ? (l(), o("p", W, r(v.value), 1)) : p("", !0),
      _.value ? (l(), o("p", Z, r(_.value), 1)) : p("", !0),
      i.value && !u.value.length ? (l(), o("div", tt, "正在从 GitHub 拉取插件…")) : u.value.length ? (l(), o("ul", et, [
        (l(!0), o(M, null, S(u.value, (t) => (l(), o("li", {
          key: t.full_name,
          class: "mp-card"
        }, [
          s("div", st, [
            t.avatar ? (l(), o("img", {
              key: 0,
              class: "mp-avatar",
              src: t.avatar,
              alt: t.owner,
              loading: "lazy"
            }, null, 8, nt)) : p("", !0),
            s("div", lt, [
              s("a", {
                href: t.url,
                target: "_blank",
                rel: "noopener noreferrer"
              }, r(t.full_name), 9, ot),
              s("span", rt, [
                h(r(t.manifest?.name || t.name), 1),
                t.manifest?.version ? (l(), o(M, { key: 0 }, [
                  h(" · v" + r(t.manifest.version), 1)
                ], 64)) : p("", !0)
              ])
            ]),
            s("span", {
              class: "mp-stars",
              title: `${t.stars} stars`
            }, "★ " + r(t.stars), 9, it)
          ]),
          s("p", ct, r(t.manifest?.description || t.description || "—"), 1),
          t.topics.length ? (l(), o("div", ut, [
            (l(!0), o(M, null, S(t.topics.slice(0, 6), (n) => (l(), o("span", {
              key: n,
              class: "mp-chip"
            }, r(n), 1))), 128)),
            t.topics.length > 6 ? (l(), o("span", dt, "+" + r(t.topics.length - 6), 1)) : p("", !0)
          ])) : p("", !0),
          t.error ? (l(), o("p", pt, r(t.error), 1)) : p("", !0),
          s("div", vt, [
            t.installed ? (l(), o("span", ht, "已安装")) : (l(), o("button", {
              key: 0,
              class: "mp-btn small install",
              disabled: !!k.value,
              onClick: (n) => V(t)
            }, r(t.installing ? "安装中…" : "安装"), 9, ft)),
            s("button", {
              class: "mp-btn small tonal",
              onClick: (n) => A(t)
            }, r(y.value === t.full_name ? "已复制" : "复制命令"), 9, mt),
            s("a", {
              class: "mp-btn small tonal",
              href: t.url,
              target: "_blank",
              rel: "noopener noreferrer"
            }, "打开", 8, _t)
          ])
        ]))), 128))
      ])) : (l(), o("div", at, r(m.value ? "没有匹配的插件" : "暂无插件"), 1)),
      u.value.length && !v.value ? (l(), o("nav", yt, [
        s("button", {
          class: "mp-btn small tonal",
          disabled: !G.value || i.value,
          onClick: a[4] || (a[4] = (t) => E(f.value - 1))
        }, "上一页", 8, gt),
        s("span", kt, "第 " + r(f.value) + " / " + r(T.value) + " 页 · 共 " + r(C.value) + " 个插件", 1),
        s("button", {
          class: "mp-btn small tonal",
          disabled: !I.value || i.value,
          onClick: a[5] || (a[5] = (t) => E(f.value + 1))
        }, "下一页", 8, wt)
      ])) : p("", !0),
      a[10] || (a[10] = s("p", { class: "mp-note" }, [
        h("一键安装会调用本机 Core 的 "),
        s("code", null, "/api/plugins/install"),
        h("，由 "),
        s("code", null, "0kay-pm"),
        h(" 完成下载与构建；未登录的 GitHub 搜索接口每小时约 60 次。")
      ], -1))
    ]));
  }
}), Ct = ($, u) => {
  const i = $.__vccOpts || $;
  for (const [v, m] of u)
    i[v] = m;
  return i;
}, Pt = /* @__PURE__ */ Ct($t, [["__scopeId", "data-v-30418d89"]]);
export {
  Pt as default
};

;(()=>{if(typeof document!=='undefined'&&!document.getElementById('marketplace-plugin-style')){const s=document.createElement('style');s.id='marketplace-plugin-style';s.textContent=".mp[data-v-30418d89]{--code-font: ui-monospace, \"Cascadia Code\", \"JetBrains Mono\", Consolas, \"SFMono-Regular\", Menlo, monospace;box-sizing:border-box;flex:1;min-height:0;width:100%;overflow-y:auto;overscroll-behavior:contain;padding:clamp(20px,2.6vw,36px) max(clamp(20px,2.6vw,36px),calc((100% - 1100px)/2))}.mp-hero[data-v-30418d89]{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px}.mp-eyebrow[data-v-30418d89]{margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.18em;color:var(--md-primary)}.mp-hero h1[data-v-30418d89]{margin:0;font-size:clamp(26px,3vw,38px);font-weight:850;letter-spacing:-.02em}.mp-sub[data-v-30418d89]{margin:8px 0 0;color:var(--md-on-surface-variant);font-size:15px}.mp-sub code[data-v-30418d89],.mp-note code[data-v-30418d89]{font-family:var(--code-font);font-size:.9em;background:var(--md-surface-container-high);padding:2px 6px;border-radius:8px}.mp-actions[data-v-30418d89]{display:flex;gap:10px;flex-wrap:wrap}.mp-search[data-v-30418d89]{min-height:44px;padding:0 16px;min-width:220px;border:1px solid var(--md-outline-variant);border-radius:999px;background:var(--md-surface-container-high);color:var(--md-on-surface);font:inherit;outline:none}.mp-search[data-v-30418d89]:focus{border-color:var(--md-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--md-primary) 14%,transparent)}.mp-btn[data-v-30418d89]{min-height:44px;padding:0 20px;border:0;border-radius:999px;background:var(--md-primary);color:var(--md-on-primary);font:700 14px/1 inherit;cursor:pointer;transition:transform .2s var(--ease-spring, ease),filter .15s}.mp-btn[data-v-30418d89]:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.05)}.mp-btn[data-v-30418d89]:disabled{opacity:.55;cursor:default}.mp-btn.tonal[data-v-30418d89]{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}.mp-btn.small[data-v-30418d89]{min-height:34px;padding:0 14px;font-size:13px}.mp-btn.small.tonal[data-v-30418d89]{background:var(--md-secondary-container);color:var(--md-on-secondary-container);display:inline-flex;align-items:center;text-decoration:none}.mp-btn.small.install[data-v-30418d89]{background:var(--md-primary);color:var(--md-on-primary)}.mp-installed[data-v-30418d89]{font-size:13px;font-weight:750;color:var(--md-primary)}.mp-alert[data-v-30418d89]{padding:12px 16px;border-radius:16px;background:var(--md-error-container);color:#410e0b;font-size:13px}.mp-notice[data-v-30418d89]{padding:12px 16px;border-radius:16px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);font-size:13px}.mp-err[data-v-30418d89]{margin:0;font-size:12px;color:#b3261e}.mp-empty[data-v-30418d89]{padding:40px;text-align:center;color:var(--md-on-surface-variant);background:var(--md-surface-container-low);border-radius:20px}.mp-grid[data-v-30418d89]{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}.mp-card[data-v-30418d89]{display:flex;flex-direction:column;gap:12px;padding:18px;border:1px solid var(--md-outline-variant);border-radius:24px 24px 24px 8px;background:var(--md-surface-container-low);transition:transform .24s var(--ease-spring, ease),box-shadow .24s,border-color .24s}.mp-card[data-v-30418d89]:hover{transform:translateY(-3px);box-shadow:var(--shadow-2, 0 8px 24px rgba(20,18,36,.14));border-color:color-mix(in srgb,var(--md-primary) 35%,var(--md-outline-variant))}.mp-head[data-v-30418d89]{display:flex;align-items:center;gap:12px}.mp-avatar[data-v-30418d89]{width:40px;height:40px;border-radius:14px;flex:none}.mp-title[data-v-30418d89]{display:flex;flex-direction:column;min-width:0;flex:1}.mp-title a[data-v-30418d89]{color:var(--md-on-surface);font-weight:750;font-size:15px;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-title a[data-v-30418d89]:hover{color:var(--md-primary);text-decoration:underline}.mp-owner[data-v-30418d89]{color:var(--md-on-surface-variant);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-stars[data-v-30418d89]{flex:none;font-weight:700;font-size:12.5px;color:var(--md-primary);background:color-mix(in srgb,var(--md-primary) 12%,transparent);border-radius:999px;padding:4px 10px}.mp-desc[data-v-30418d89]{margin:0;color:var(--md-on-surface-variant);font-size:13.5px;line-height:1.6;flex:1}.mp-chips[data-v-30418d89]{display:flex;flex-wrap:wrap;gap:6px}.mp-chip[data-v-30418d89]{font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:999px;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}.mp-chip.muted[data-v-30418d89]{background:var(--md-surface-container-high);color:var(--md-on-surface-variant)}.mp-foot[data-v-30418d89]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mp-pager[data-v-30418d89]{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:26px;flex-wrap:wrap}.mp-count[data-v-30418d89]{color:var(--md-on-surface-variant);font-size:13px}.mp-note[data-v-30418d89]{margin:26px 0 0;color:var(--md-on-surface-variant);font-size:12.5px}\n";document.head.appendChild(s)}})();
