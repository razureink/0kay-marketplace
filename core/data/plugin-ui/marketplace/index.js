import { defineComponent as D, ref as p, computed as T, onMounted as F, openBlock as o, createElementBlock as r, createElementVNode as l, createTextVNode as h, toDisplayString as i, withDirectives as Y, withKeys as J, vModelText as X, createCommentVNode as v, Fragment as M, renderList as N } from "vue";
const Q = { class: "mp" }, W = { class: "mp-hero" }, Z = { class: "mp-actions" }, ee = ["disabled"], te = ["disabled"], ae = {
  key: 0,
  class: "mp-alert"
}, ne = {
  key: 1,
  class: "mp-notice"
}, se = {
  key: 2,
  class: "mp-empty"
}, le = {
  key: 3,
  class: "mp-empty"
}, oe = {
  key: 4,
  class: "mp-grid"
}, re = { class: "mp-head" }, ie = ["src", "alt"], ce = { class: "mp-title" }, ue = ["href"], pe = { class: "mp-owner" }, de = ["title"], fe = { class: "mp-desc" }, ve = {
  key: 0,
  class: "mp-chips"
}, me = {
  key: 0,
  class: "mp-chip muted"
}, _e = {
  key: 1,
  class: "mp-err"
}, he = { class: "mp-foot" }, ye = ["disabled", "onClick"], ge = ["disabled", "onClick"], be = {
  key: 2,
  class: "mp-installed"
}, ke = ["onClick"], we = ["href"], $e = {
  key: 5,
  class: "mp-pager"
}, Ce = ["disabled"], Te = { class: "mp-count" }, Me = ["disabled"], S = "0kay-plugin", j = 12, Pe = 1e3, Ae = /* @__PURE__ */ D({
  __name: "MarketplacePage",
  setup(w) {
    const d = p([]), u = p(!1), m = p(""), y = p(""), b = p(""), _ = p(1), $ = p(0), g = p(""), f = p(""), x = p(/* @__PURE__ */ new Map()), O = p(/* @__PURE__ */ new Map());
    function P(t) {
      return String(t || "").replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "").replace(/\/+$/, "").toLowerCase();
    }
    const C = T(() => Math.max(1, Math.ceil($.value / j))), R = T(() => _.value > 1), H = T(() => _.value < C.value);
    function G(t) {
      return t.manifest?.name || t.full_name;
    }
    function K(t) {
      return `0kay-pm install ${t.full_name}`;
    }
    async function q(t, a) {
      try {
        const e = await fetch(`https://raw.githubusercontent.com/${t}/${a}/manifest.json`);
        return e.ok ? await e.json() : null;
      } catch {
        return null;
      }
    }
    async function B() {
      const t = [...d.value], a = Array.from({ length: 6 }, async () => {
        for (; t.length; ) {
          const e = t.shift();
          if (!e) break;
          e.loadingManifest = !0;
          const s = await q(e.full_name, e.branch);
          s && (e.manifest = { name: s.name, version: s.version, description: s.description }), e.loadingManifest = !1;
        }
      });
      await Promise.all(a);
    }
    async function I() {
      try {
        const t = await fetch("/api/plugins/installed");
        if (!t.ok) return;
        const a = await t.json(), e = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
        for (const n of Array.isArray(a?.installed) ? a.installed : [])
          n?.name && (e.set(n.name, n), n.repository && s.set(P(n.repository), n));
        for (const n of Array.isArray(a?.packages) ? a.packages : [])
          e.has(n) || e.set(n, { name: n });
        x.value = e, O.value = s;
        for (const n of d.value) {
          const c = e.get(G(n)) || s.get(P(n.url));
          c && (n.installed = !0, n.entryName = c.name, n.removable = c.source === "pm");
        }
      } catch {
      }
    }
    async function k(t = 1) {
      u.value = !0, m.value = "", b.value = "", f.value = "";
      const a = y.value.trim(), e = `topic:${S}` + (a ? ` ${a}` : "");
      try {
        const s = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(e)}&sort=stars&order=desc&per_page=${j}&page=${t}`,
          { headers: { Accept: "application/vnd.github+json" } }
        );
        if (!s.ok) throw new Error(`GitHub HTTP ${s.status}`);
        const n = await s.json();
        $.value = Math.min(n.total_count || 0, Pe), _.value = t, d.value = (n.items || []).map((c) => ({
          full_name: c.full_name,
          name: c.name,
          owner: c.owner?.login || "",
          avatar: c.owner?.avatar_url || "",
          description: c.description || "",
          stars: c.stargazers_count || 0,
          url: c.html_url,
          branch: c.default_branch || "main",
          topics: c.topics || []
        })), await B(), await I();
      } catch (s) {
        m.value = s?.message || String(s);
      } finally {
        u.value = !1;
      }
    }
    function A(t) {
      u.value || t < 1 || t > C.value || k(t);
    }
    async function L(t) {
      try {
        await navigator.clipboard.writeText(K(t)), b.value = t.full_name, setTimeout(() => {
          b.value === t.full_name && (b.value = "");
        }, 1500);
      } catch {
      }
    }
    async function V(t) {
      for (let a = 0; a < 400; a++) {
        await new Promise((n) => setTimeout(n, 1500));
        const e = await fetch("/api/plugins/install/status");
        if (!e.ok) continue;
        const s = await e.json();
        if (s.status === "done") {
          t(), await fetch("/api/ui/patches", { method: "POST" }), setTimeout(() => location.reload(), 1200);
          return;
        }
        if (s.status === "failed") throw new Error(s.error || "操作失败");
      }
      throw new Error("操作超时");
    }
    async function E(t, a, e, s) {
      a.error = "", a.installing = !0, g.value = a.full_name;
      try {
        const n = await fetch(t, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ package: e })
        });
        if (n.status === 404) {
          f.value = "当前 Core 不支持该操作";
          return;
        }
        const c = await n.json().catch(() => ({}));
        if (!n.ok) throw new Error(c.error || `HTTP ${n.status}`);
        await V(s);
      } catch (n) {
        a.error = n?.message || String(n);
      } finally {
        a.installing = !1, g.value = "";
      }
    }
    function z(t) {
      if (!(g.value || t.installed))
        return f.value = "", E("/api/plugins/install", t, t.full_name, () => {
          t.installed = !0, t.entryName = t.manifest?.name || t.full_name, f.value = `已安装 ${t.full_name}，正在刷新…`;
        });
    }
    function U(t) {
      if (g.value || !t.installed) return;
      const a = t.entryName || t.full_name;
      if (window.confirm(`确定卸载 ${a}？`))
        return f.value = "", E("/api/plugins/uninstall", t, a, () => {
          t.installed = !1, t.removable = !1, t.entryName = void 0, f.value = `已卸载 ${a}，正在刷新…`;
        });
    }
    return F(() => k(1)), (t, a) => (o(), r("div", Q, [
      l("header", W, [
        l("div", null, [
          a[8] || (a[8] = l("p", { class: "mp-eyebrow" }, "0KAY MARKETPLACE", -1)),
          a[9] || (a[9] = l("h1", null, "插件市场", -1)),
          l("p", { class: "mp-sub" }, [
            a[6] || (a[6] = h("来自 GitHub topic ", -1)),
            l("code", null, i(S)),
            a[7] || (a[7] = h(" 的 0KAY 插件，可直接一键安装。", -1))
          ])
        ]),
        l("div", Z, [
          Y(l("input", {
            "onUpdate:modelValue": a[0] || (a[0] = (e) => y.value = e),
            class: "mp-search",
            type: "search",
            placeholder: "搜索插件…",
            "aria-label": "搜索插件",
            onKeyup: a[1] || (a[1] = J((e) => k(1), ["enter"]))
          }, null, 544), [
            [X, y.value]
          ]),
          l("button", {
            class: "mp-btn",
            disabled: u.value,
            onClick: a[2] || (a[2] = (e) => k(1))
          }, i(u.value ? "加载中…" : "搜索"), 9, ee),
          l("button", {
            class: "mp-btn tonal",
            disabled: u.value,
            onClick: a[3] || (a[3] = (e) => k(_.value))
          }, "刷新", 8, te)
        ])
      ]),
      m.value ? (o(), r("p", ae, i(m.value), 1)) : v("", !0),
      f.value ? (o(), r("p", ne, i(f.value), 1)) : v("", !0),
      u.value && !d.value.length ? (o(), r("div", se, "正在从 GitHub 拉取插件…")) : d.value.length ? (o(), r("ul", oe, [
        (o(!0), r(M, null, N(d.value, (e) => (o(), r("li", {
          key: e.full_name,
          class: "mp-card"
        }, [
          l("div", re, [
            e.avatar ? (o(), r("img", {
              key: 0,
              class: "mp-avatar",
              src: e.avatar,
              alt: e.owner,
              loading: "lazy"
            }, null, 8, ie)) : v("", !0),
            l("div", ce, [
              l("a", {
                href: e.url,
                target: "_blank",
                rel: "noopener noreferrer"
              }, i(e.full_name), 9, ue),
              l("span", pe, [
                h(i(e.manifest?.name || e.name), 1),
                e.manifest?.version ? (o(), r(M, { key: 0 }, [
                  h(" · v" + i(e.manifest.version), 1)
                ], 64)) : v("", !0)
              ])
            ]),
            l("span", {
              class: "mp-stars",
              title: `${e.stars} stars`
            }, "★ " + i(e.stars), 9, de)
          ]),
          l("p", fe, i(e.manifest?.description || e.description || "—"), 1),
          e.topics.length ? (o(), r("div", ve, [
            (o(!0), r(M, null, N(e.topics.slice(0, 6), (s) => (o(), r("span", {
              key: s,
              class: "mp-chip"
            }, i(s), 1))), 128)),
            e.topics.length > 6 ? (o(), r("span", me, "+" + i(e.topics.length - 6), 1)) : v("", !0)
          ])) : v("", !0),
          e.error ? (o(), r("p", _e, i(e.error), 1)) : v("", !0),
          l("div", he, [
            e.installed ? e.removable ? (o(), r("button", {
              key: 1,
              class: "mp-btn small danger",
              disabled: !!g.value,
              onClick: (s) => U(e)
            }, i(e.installing ? "卸载中…" : "卸载"), 9, ge)) : (o(), r("span", be, "已安装")) : (o(), r("button", {
              key: 0,
              class: "mp-btn small install",
              disabled: !!g.value,
              onClick: (s) => z(e)
            }, i(e.installing ? "安装中…" : "安装"), 9, ye)),
            l("button", {
              class: "mp-btn small tonal",
              onClick: (s) => L(e)
            }, i(b.value === e.full_name ? "已复制" : "复制命令"), 9, ke),
            l("a", {
              class: "mp-btn small tonal",
              href: e.url,
              target: "_blank",
              rel: "noopener noreferrer"
            }, "打开", 8, we)
          ])
        ]))), 128))
      ])) : (o(), r("div", le, i(y.value ? "没有匹配的插件" : "暂无插件"), 1)),
      d.value.length && !m.value ? (o(), r("nav", $e, [
        l("button", {
          class: "mp-btn small tonal",
          disabled: !R.value || u.value,
          onClick: a[4] || (a[4] = (e) => A(_.value - 1))
        }, "上一页", 8, Ce),
        l("span", Te, "第 " + i(_.value) + " / " + i(C.value) + " 页 · 共 " + i($.value) + " 个插件", 1),
        l("button", {
          class: "mp-btn small tonal",
          disabled: !H.value || u.value,
          onClick: a[5] || (a[5] = (e) => A(_.value + 1))
        }, "下一页", 8, Me)
      ])) : v("", !0),
      a[10] || (a[10] = l("p", { class: "mp-note" }, [
        h("一键安装会调用本机 Core 的 "),
        l("code", null, "/api/plugins/install"),
        h("，由 "),
        l("code", null, "0kay-pm"),
        h(" 完成下载与构建；未登录的 GitHub 搜索接口每小时约 60 次。")
      ], -1))
    ]));
  }
}), Ee = (w, d) => {
  const u = w.__vccOpts || w;
  for (const [m, y] of d)
    u[m] = y;
  return u;
}, Se = /* @__PURE__ */ Ee(Ae, [["__scopeId", "data-v-fa4555ae"]]);
export {
  Se as default
};

;(()=>{if(typeof document!=='undefined'&&!document.getElementById('marketplace-plugin-style')){const s=document.createElement('style');s.id='marketplace-plugin-style';s.textContent=".mp[data-v-fa4555ae]{--code-font: ui-monospace, \"Cascadia Code\", \"JetBrains Mono\", Consolas, \"SFMono-Regular\", Menlo, monospace;box-sizing:border-box;flex:1;min-height:0;width:100%;overflow-y:auto;overscroll-behavior:contain;padding:clamp(20px,2.6vw,36px) max(clamp(20px,2.6vw,36px),calc((100% - 1100px)/2))}.mp-hero[data-v-fa4555ae]{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px}.mp-eyebrow[data-v-fa4555ae]{margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.18em;color:var(--md-primary)}.mp-hero h1[data-v-fa4555ae]{margin:0;font-size:clamp(26px,3vw,38px);font-weight:850;letter-spacing:-.02em}.mp-sub[data-v-fa4555ae]{margin:8px 0 0;color:var(--md-on-surface-variant);font-size:15px}.mp-sub code[data-v-fa4555ae],.mp-note code[data-v-fa4555ae]{font-family:var(--code-font);font-size:.9em;background:var(--md-surface-container-high);padding:2px 6px;border-radius:8px}.mp-actions[data-v-fa4555ae]{display:flex;gap:10px;flex-wrap:wrap}.mp-search[data-v-fa4555ae]{min-height:44px;padding:0 16px;min-width:220px;border:1px solid var(--md-outline-variant);border-radius:999px;background:var(--md-surface-container-high);color:var(--md-on-surface);font:inherit;outline:none}.mp-search[data-v-fa4555ae]:focus{border-color:var(--md-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--md-primary) 14%,transparent)}.mp-btn[data-v-fa4555ae]{min-height:44px;padding:0 20px;border:0;border-radius:999px;background:var(--md-primary);color:var(--md-on-primary);font:700 14px/1 inherit;cursor:pointer;transition:transform .2s var(--ease-spring, ease),filter .15s}.mp-btn[data-v-fa4555ae]:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.05)}.mp-btn[data-v-fa4555ae]:disabled{opacity:.55;cursor:default}.mp-btn.tonal[data-v-fa4555ae]{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}.mp-btn.small[data-v-fa4555ae]{min-height:34px;padding:0 14px;font-size:13px}.mp-btn.small.tonal[data-v-fa4555ae]{background:var(--md-secondary-container);color:var(--md-on-secondary-container);display:inline-flex;align-items:center;text-decoration:none}.mp-btn.small.install[data-v-fa4555ae]{background:var(--md-primary);color:var(--md-on-primary)}.mp-btn.small.danger[data-v-fa4555ae]{background:var(--md-error-container);color:#410e0b}.mp-installed[data-v-fa4555ae]{font-size:13px;font-weight:750;color:var(--md-primary)}.mp-alert[data-v-fa4555ae]{padding:12px 16px;border-radius:16px;background:var(--md-error-container);color:#410e0b;font-size:13px}.mp-notice[data-v-fa4555ae]{padding:12px 16px;border-radius:16px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);font-size:13px}.mp-err[data-v-fa4555ae]{margin:0;font-size:12px;color:#b3261e}.mp-empty[data-v-fa4555ae]{padding:40px;text-align:center;color:var(--md-on-surface-variant);background:var(--md-surface-container-low);border-radius:20px}.mp-grid[data-v-fa4555ae]{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}.mp-card[data-v-fa4555ae]{display:flex;flex-direction:column;gap:12px;padding:18px;border:1px solid var(--md-outline-variant);border-radius:24px 24px 24px 8px;background:var(--md-surface-container-low);transition:transform .24s var(--ease-spring, ease),box-shadow .24s,border-color .24s}.mp-card[data-v-fa4555ae]:hover{transform:translateY(-3px);box-shadow:var(--shadow-2, 0 8px 24px rgba(20,18,36,.14));border-color:color-mix(in srgb,var(--md-primary) 35%,var(--md-outline-variant))}.mp-head[data-v-fa4555ae]{display:flex;align-items:center;gap:12px}.mp-avatar[data-v-fa4555ae]{width:40px;height:40px;border-radius:14px;flex:none}.mp-title[data-v-fa4555ae]{display:flex;flex-direction:column;min-width:0;flex:1}.mp-title a[data-v-fa4555ae]{color:var(--md-on-surface);font-weight:750;font-size:15px;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-title a[data-v-fa4555ae]:hover{color:var(--md-primary);text-decoration:underline}.mp-owner[data-v-fa4555ae]{color:var(--md-on-surface-variant);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mp-stars[data-v-fa4555ae]{flex:none;font-weight:700;font-size:12.5px;color:var(--md-primary);background:color-mix(in srgb,var(--md-primary) 12%,transparent);border-radius:999px;padding:4px 10px}.mp-desc[data-v-fa4555ae]{margin:0;color:var(--md-on-surface-variant);font-size:13.5px;line-height:1.6;flex:1}.mp-chips[data-v-fa4555ae]{display:flex;flex-wrap:wrap;gap:6px}.mp-chip[data-v-fa4555ae]{font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:999px;background:var(--md-secondary-container);color:var(--md-on-secondary-container)}.mp-chip.muted[data-v-fa4555ae]{background:var(--md-surface-container-high);color:var(--md-on-surface-variant)}.mp-foot[data-v-fa4555ae]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mp-pager[data-v-fa4555ae]{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:26px;flex-wrap:wrap}.mp-count[data-v-fa4555ae]{color:var(--md-on-surface-variant);font-size:13px}.mp-note[data-v-fa4555ae]{margin:26px 0 0;color:var(--md-on-surface-variant);font-size:12.5px}\n";document.head.appendChild(s)}})();
