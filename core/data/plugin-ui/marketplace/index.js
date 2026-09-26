import { defineComponent as R, ref as u, computed as P, onMounted as V, openBlock as l, createElementBlock as o, createElementVNode as a, createTextVNode as m, toDisplayString as r, withDirectives as L, withKeys as U, vModelText as z, createCommentVNode as p, Fragment as M, renderList as A } from "vue";
const B = { class: "mp" }, D = { class: "mp-hero" }, F = { class: "mp-actions" }, Y = ["disabled"], J = ["disabled"], X = {
  key: 0,
  class: "mp-alert"
}, Q = {
  key: 1,
  class: "mp-notice"
}, W = {
  key: 2,
  class: "mp-empty"
}, Z = {
  key: 3,
  class: "mp-empty"
}, tt = {
  key: 4,
  class: "mp-grid"
}, et = { class: "mp-head" }, st = ["src", "alt"], at = { class: "mp-title" }, nt = ["href"], lt = { class: "mp-owner" }, ot = ["title"], rt = { class: "mp-desc" }, it = {
  key: 0,
  class: "mp-chips"
}, ct = {
  key: 0,
  class: "mp-chip muted"
}, ut = {
  key: 1,
  class: "mp-err"
}, dt = { class: "mp-foot" }, pt = ["disabled", "onClick"], vt = {
  key: 1,
  class: "mp-installed"
}, ft = ["onClick"], mt = ["href"], _t = {
  key: 5,
  class: "mp-pager"
}, ht = ["disabled"], gt = { class: "mp-count" }, yt = ["disabled"], S = "0kay-plugin", j = 12, bt = 1e3, kt = /* @__PURE__ */ R({
  __name: "MarketplacePage",
  setup(w) {
    const d = u([]), i = u(!1), v = u(""), _ = u(""), g = u(""), f = u(1), $ = u(0), b = u(""), h = u(""), C = P(() => Math.max(1, Math.ceil($.value / j))), H = P(() => f.value > 1), G = P(() => f.value < C.value);
    function T(s) {
      return s.manifest?.name || s.full_name;
    }
    function K(s) {
      return `0kay-pm install ${T(s)}`;
    }
    async function N(s, e) {
      try {
        const t = await fetch(`https://raw.githubusercontent.com/${s}/${e}/manifest.json`);
        return t.ok ? await t.json() : null;
      } catch {
        return null;
      }
    }
    async function O() {
      const s = [...d.value], e = Array.from({ length: 6 }, async () => {
        for (; s.length; ) {
          const t = s.shift();
          if (!t) break;
          t.loadingManifest = !0;
          const n = await N(t.full_name, t.branch);
          n && (t.manifest = { name: n.name, version: n.version, description: n.description }), t.loadingManifest = !1;
        }
      });
      await Promise.all(e);
    }
    async function y(s = 1) {
      i.value = !0, v.value = "", g.value = "", h.value = "";
      const e = _.value.trim(), t = `topic:${S}` + (e ? ` ${e}` : "");
      try {
        const n = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(t)}&sort=stars&order=desc&per_page=${j}&page=${s}`,
          { headers: { Accept: "application/vnd.github+json" } }
        );
        if (!n.ok) throw new Error(`GitHub HTTP ${n.status}`);
        const k = await n.json();
        $.value = Math.min(k.total_count || 0, bt), f.value = s, d.value = (k.items || []).map((c) => ({
          full_name: c.full_name,
          name: c.name,
          owner: c.owner?.login || "",
          avatar: c.owner?.avatar_url || "",
          description: c.description || "",
          stars: c.stargazers_count || 0,
          url: c.html_url,
          branch: c.default_branch || "main",
          topics: c.topics || []
        })), await O();
      } catch (n) {
        v.value = n?.message || String(n);
      } finally {
        i.value = !1;
      }
    }
    function E(s) {
      i.value || s < 1 || s > C.value || y(s);
    }
    async function x(s) {
      try {
        await navigator.clipboard.writeText(K(s)), g.value = s.full_name, setTimeout(() => {
          g.value === s.full_name && (g.value = "");
        }, 1500);
      } catch {
      }
    }
    async function q(s) {
      for (let e = 0; e < 400; e++) {
        await new Promise((k) => setTimeout(k, 1500));
        const t = await fetch("/api/plugins/install/status");
        if (!t.ok) continue;
        const n = await t.json();
        if (n.status === "done") {
          s.installed = !0, h.value = `已安装 ${T(s)}，正在刷新…`, await fetch("/api/ui/patches", { method: "POST" }), setTimeout(() => location.reload(), 1200);
          return;
        }
        if (n.status === "failed") throw new Error(n.error || "安装失败");
      }
      throw new Error("安装超时");
    }
    async function I(s) {
      if (!(b.value || s.installed)) {
        h.value = "", s.error = "", s.installing = !0, b.value = s.full_name;
        try {
          const e = await fetch("/api/plugins/install", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ package: T(s) })
          });
          if (e.status === 404) {
            await x(s), h.value = "当前 Core 不支持一键安装，已复制安装命令";
            return;
          }
          const t = await e.json().catch(() => ({}));
          if (!e.ok) throw new Error(t.error || `HTTP ${e.status}`);
          await q(s);
        } catch (e) {
          s.error = e?.message || String(e);
        } finally {
          s.installing = !1, b.value = "";
        }
      }
    }
    return V(() => y(1)), (s, e) => (l(), o("div", B, [
      a("header", D, [
        a("div", null, [
          e[8] || (e[8] = a("p", { class: "mp-eyebrow" }, "0KAY MARKETPLACE", -1)),
          e[9] || (e[9] = a("h1", null, "插件市场", -1)),
          a("p", { class: "mp-sub" }, [
            e[6] || (e[6] = m("来自 GitHub topic ", -1)),
            a("code", null, r(S)),
            e[7] || (e[7] = m(" 的 0KAY 插件，可直接一键安装。", -1))
          ])
        ]),
        a("div", F, [
          L(a("input", {
            "onUpdate:modelValue": e[0] || (e[0] = (t) => _.value = t),
            class: "mp-search",
            type: "search",
            placeholder: "搜索插件…",
            "aria-label": "搜索插件",
            onKeyup: e[1] || (e[1] = U((t) => y(1), ["enter"]))
          }, null, 544), [
            [z, _.value]
          ]),
          a("button", {
            class: "mp-btn",
            disabled: i.value,
            onClick: e[2] || (e[2] = (t) => y(1))
          }, r(i.value ? "加载中…" : "搜索"), 9, Y),
          a("button", {
            class: "mp-btn tonal",
            disabled: i.value,
            onClick: e[3] || (e[3] = (t) => y(f.value))
          }, "刷新", 8, J)
        ])
      ]),
      v.value ? (l(), o("p", X, r(v.value), 1)) : p("", !0),
      h.value ? (l(), o("p", Q, r(h.value), 1)) : p("", !0),
      i.value && !d.value.length ? (l(), o("div", W, "正在从 GitHub 拉取插件…")) : d.value.length ? (l(), o("ul", tt, [
        (l(!0), o(M, null, A(d.value, (t) => (l(), o("li", {
          key: t.full_name,
          class: "mp-card"
        }, [
          a("div", et, [
            t.avatar ? (l(), o("img", {
              key: 0,
              class: "mp-avatar",
              src: t.avatar,
              alt: t.owner,
              loading: "lazy"
            }, null, 8, st)) : p("", !0),
            a("div", at, [
              a("a", {
                href: t.url,
                target: "_blank",
                rel: "noopener noreferrer"
              }, r(t.full_name), 9, nt),
              a("span", lt, [
                m(r(t.manifest?.name || t.name), 1),
                t.manifest?.version ? (l(), o(M, { key: 0 }, [
                  m(" · v" + r(t.manifest.version), 1)
                ], 64)) : p("", !0)
              ])
            ]),
            a("span", {
              class: "mp-stars",
              title: `${t.stars} stars`
            }, "★ " + r(t.stars), 9, ot)
          ]),
          a("p", rt, r(t.manifest?.description || t.description || "—"), 1),
          t.topics.length ? (l(), o("div", it, [
            (l(!0), o(M, null, A(t.topics.slice(0, 6), (n) => (l(), o("span", {
              key: n,
              class: "mp-chip"
            }, r(n), 1))), 128)),
            t.topics.length > 6 ? (l(), o("span", ct, "+" + r(t.topics.length - 6), 1)) : p("", !0)
          ])) : p("", !0),
          t.error ? (l(), o("p", ut, r(t.error), 1)) : p("", !0),
          a("div", dt, [
            t.installed ? (l(), o("span", vt, "已安装")) : (l(), o("button", {
              key: 0,
              class: "mp-btn small install",
              disabled: !!b.value,
              onClick: (n) => I(t)
            }, r(t.installing ? "安装中…" : "安装"), 9, pt)),
            a("button", {
              class: "mp-btn small tonal",
              onClick: (n) => x(t)
            }, r(g.value === t.full_name ? "已复制" : "复制命令"), 9, ft),
            a("a", {
              class: "mp-btn small tonal",
              href: t.url,
              target: "_blank",
              rel: "noopener noreferrer"
            }, "打开", 8, mt)
          ])
        ]))), 128))
      ])) : (l(), o("div", Z, r(_.value ? "没有匹配的插件" : "暂无插件"), 1)),
      d.value.length && !v.value ? (l(), o("nav", _t, [
        a("button", {
          class: "mp-btn small tonal",
          disabled: !H.value || i.value,
          onClick: e[4] || (e[4] = (t) => E(f.value - 1))
        }, "上一页", 8, ht),
        a("span", gt, "第 " + r(f.value) + " / " + r(C.value) + " 页 · 共 " + r($.value) + " 个插件", 1),
        a("button", {
          class: "mp-btn small tonal",
          disabled: !G.value || i.value,
          onClick: e[5] || (e[5] = (t) => E(f.value + 1))
        }, "下一页", 8, yt)
      ])) : p("", !0),
      e[10] || (e[10] = a("p", { class: "mp-note" }, [
        m("一键安装会调用本机 Core 的 "),
        a("code", null, "/api/plugins/install"),
        m("，由 "),
        a("code", null, "0kay-pm"),
        m(" 完成下载与构建；未登录的 GitHub 搜索接口每小时约 60 次。")
      ], -1))
    ]));
  }
}), wt = (w, d) => {
  const i = w.__vccOpts || w;
  for (const [v, _] of d)
    i[v] = _;
  return i;
}, Ct = /* @__PURE__ */ wt(kt, [["__scopeId", "data-v-545145b4"]]);
export {
  Ct as default
};

;(()=>{if(typeof document!=='undefined'&&!document.getElementById('marketplace-plugin-style')){const s=document.createElement('style');s.id='marketplace-plugin-style';s.textContent=".mp[data-v-545145b4]{--code-font: ui-monospace, \"Cascadia Code\", \"JetBrains Mono\", Consolas, \"SFMono-Regular\", Menlo, monospace;padding:clamp(20px,2.6vw,36px);max-width:1100px;margin:0 auto}.mp-hero[data-v-545145b4]{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px}.mp-eyebrow[data-v-545145b4]{margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.18em;color:var(--md-primary)}.mp-hero h1[data-v-545145b4]{margin:0;font-size:clamp(26px,3vw,38px);font-weight:850;letter-spacing:-.02em}.mp-sub[data-v-545145b4]{margin:8px 0 0;color:var(--md-on-surface-variant);font-size:15px}.mp-sub code[data-v-545145b4],.mp-note code[data-v-545145b4]{font-family:var(--code-font);font-size:.9em;background:var(--md-surface-container-high);padding:2px 6px;border-radius:8px}.mp-actions[data-v-545145b4]{display:flex;gap:10px;flex-wrap:wrap}.mp-search[data-v-545145b4]{min-height:44px;padding:0 16px;min-width:220px;border:1px solid var(--md-outline-variant);border-radius:999px;background:var(--md-surface-container-high);color:var(--md-on-surface);font:inherit;outline:none}.mp-search[data-v-545145b4]:focus{border-color:var(--md-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--md-primary) 14%,transparent)}.mp-btn[data-v-545145b4]{min-height:44px;padding:0 20px;border:0;border-radius:999px;background:var(--md-primary);color:var(--md-on-primary);font:700 14px/1 inherit;cursor:pointer;transition:transform .2s var(--ease-spring, ease),filter .15s}.mp-btn[data-v-545145b4]:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.05)}.mp-btn[data-v-545145b4]:disabled{opacity:.55;cursor:default}.mp-btn.tonal[data-v-545145b4]{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}.mp-btn.small[data-v-545145b4]{min-height:34px;padding:0 14px;font-size:13px}.mp-btn.small.tonal[data-v-545145b4]{background:var(--md-secondary-container);color:var(--md-on-secondary-container);display:inline-flex;align-items:center;text-decoration:none}.mp-btn.small.install[data-v-545145b4]{background:var(--md-primary);color:var(--md-on-primary)}.mp-installed[data-v-545145b4]{font-size:13px;font-weight:750;color:var(--md-primary)}.mp-alert[data-v-545145b4]{padding:12px 16px;border-radius:16px;background:var(--md-error-container);color:#410e0b;font-size:13px}.mp-notice[data-v-545145b4]{padding:12px 16px;border-radius:16px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);font-size:13px}.mp-err[data-v-545145b4]{margin:0;font-size:12px;color:#b3261e}.mp-empty[data-v-545145b4]{padding:40px;text-align:center;color:var(--md-on-surface-variant);background:var(--md-surface-container-low);border-radius:20px}.mp-grid[data-v-545145b4]{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}.mp-card[data-v-545145b4]{display:flex;flex-direction:column;gap:12px;padding:18px;border:1px solid var(--md-outline-variant);border-radius:24px 24px 24px 8px;background:var(--md-surface-container-low);transition:transform .24s var(--ease-spring, ease),box-shadow .24s,border-color .24s}.mp-card[data-v-545145b4]:hover{transform:translateY(-3px);box-shadow:var(--shadow-2, 0 8px 24px rgba(20,18,36,.14));border-color:color-mix(in srgb,var(--md-primary) 35%,var(--md-outline-variant))}.mp-head[data-v-545145b4]{display:flex;align-items:center;gap:12px}.mp-avatar[data-v-545145b4]{width:40px;height:40px;border-radius:14px;flex:none}.mp-title[data-v-545145b4]{display:flex;flex-direction:column;min-width:0;flex:1}.mp-title a[data-v-545145b4]{color:var(--md-on-surface);font-weight:750;font-size:15px;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-title a[data-v-545145b4]:hover{color:var(--md-primary);text-decoration:underline}.mp-owner[data-v-545145b4]{color:var(--md-on-surface-variant);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-stars[data-v-545145b4]{flex:none;font-weight:700;font-size:12.5px;color:var(--md-primary);background:color-mix(in srgb,var(--md-primary) 12%,transparent);border-radius:999px;padding:4px 10px}.mp-desc[data-v-545145b4]{margin:0;color:var(--md-on-surface-variant);font-size:13.5px;line-height:1.6;flex:1}.mp-chips[data-v-545145b4]{display:flex;flex-wrap:wrap;gap:6px}.mp-chip[data-v-545145b4]{font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:999px;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}.mp-chip.muted[data-v-545145b4]{background:var(--md-surface-container-high);color:var(--md-on-surface-variant)}.mp-foot[data-v-545145b4]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mp-pager[data-v-545145b4]{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:26px;flex-wrap:wrap}.mp-count[data-v-545145b4]{color:var(--md-on-surface-variant);font-size:13px}.mp-note[data-v-545145b4]{margin:26px 0 0;color:var(--md-on-surface-variant);font-size:12.5px}\n";document.head.appendChild(s)}})();
