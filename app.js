/* DPS WizzGeeks Question Bank — app */
(function () {
  "use strict";

  var DATA = (window.QUESTION_DATA || []).slice();

  var state = {
    subject: "math",
    chapters: new Set(),
    types: new Set(),
    category: "all",
    difficulty: "all",
    search: "",
    page: 1,
    perPage: 20
  };

  var els = {};

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function chapterNum(name) {
    var m = /(\d+)/.exec(name || "");
    return m ? parseInt(m[1], 10) : 999;
  }

  function subjectLabel() {
    return state.subject === "math" ? "Maths" : "Physics";
  }

  function filterData() {
    var q = state.search.trim().toLowerCase();
    return DATA.filter(function (item) {
      if (item.subject !== state.subject) return false;
      if (state.chapters.size && !state.chapters.has(item.chapter)) return false;
      if (state.types.size && !state.types.has(item.typeKey)) return false;
      if (state.category !== "all" && item.category !== state.category) return false;
      if (state.difficulty !== "all" && (item.difficulty || "") !== state.difficulty) return false;
      if (q) {
        var hay = (item.question + " " + (item.explanation || "") + " " + item.chapter).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function typeKeyOf(item) {
    return item.typeKey;
  }

  /* ---------- sidebar ---------- */

  function chapterCounts() {
    var counts = {};
    DATA.forEach(function (item) {
      if (item.subject !== state.subject) return;
      counts[item.chapter] = (counts[item.chapter] || 0) + 1;
    });
    return counts;
  }

  function typeCounts() {
    var counts = {};
    DATA.forEach(function (item) {
      if (item.subject !== state.subject) return;
      var k = typeKeyOf(item);
      counts[k] = counts[k] || { label: item.typeLabel, n: 0 };
      counts[k].n += 1;
    });
    return counts;
  }

  function categoryValues() {
    var vals = {};
    DATA.forEach(function (item) {
      if (item.subject !== state.subject) return;
      var c = item.category;
      if (c) vals[c] = (vals[c] || 0) + 1;
    });
    return vals;
  }

  function difficultyValues() {
    var vals = {};
    DATA.forEach(function (item) {
      if (item.subject !== state.subject) return;
      var d = item.difficulty;
      if (d) vals[d] = (vals[d] || 0) + 1;
    });
    return vals;
  }

  function renderChapters() {
    var counts = chapterCounts();
    var chapters = Object.keys(counts).sort(function (a, b) {
      return chapterNum(a) - chapterNum(b);
    });
    els.chapterList.innerHTML = chapters.map(function (ch) {
      var active = state.chapters.size === 0 || state.chapters.has(ch);
      return (
        '<button data-chapter="' + escAttr(ch) + '" class="chapter-opt w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md text-sm transition ' +
        (state.chapters.has(ch) ? "bg-indigo-50 text-indigo-800" : "text-slate-700 hover:bg-slate-100") + '">' +
        '<span class="w-4 h-4 rounded border flex items-center justify-center text-[10px] ' +
        (state.chapters.has(ch) ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300") + '">' +
        (state.chapters.has(ch) ? "&#10003;" : "") + "</span>" +
        '<span class="flex-1 truncate">' + esc(ch.replace(/^Chapter\s*\d+\s*-\s*/i, "")) + "</span>" +
        '<span class="text-xs text-slate-400">' + counts[ch] + "</span></button>"
      );
    }).join("");
  }

  function renderTypes() {
    var counts = typeCounts();
    els.typeList.innerHTML = Object.keys(counts).sort(function (a, b) {
      var order = ["categorytest", "mcq", "vsa", "vsatest/vsa", "vsatest/vsa_adaptive", "sa", "la", "ar", "casestudy"];
      var ia = order.indexOf(a), ib = order.indexOf(b);
      return (ia < 0 ? 10 : ia) - (ib < 0 ? 10 : ib) || a.localeCompare(b);
    }).map(function (k) {
      var active = state.types.has(k);
      return (
        '<button data-type="' + escAttr(k) + '" class="type-opt px-2.5 py-1 text-xs font-semibold rounded-full border transition ' +
        (active ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50") + '">' +
        esc(counts[k].label) + ' <span class="' + (active ? "text-indigo-200" : "text-slate-400") + '">' + counts[k].n + "</span></button>"
      );
    }).join("");
  }

  function renderSelects() {
    var cats = categoryValues();
    var catSel = els.category;
    var was = catSel.value;
    catSel.innerHTML =
      '<option value="all">All categories (' + sum(cats) + ")</option>" +
      Object.keys(cats).sort().map(function (c) {
        return '<option value="' + escAttr(c) + '">' + esc(c) + " (" + cats[c] + ")</option>";
      }).join("");
    if (was && Object.keys(cats).indexOf(was) !== -1) catSel.value = was;
    state.category = catSel.value;
    catSel.disabled = Object.keys(cats).length === 0;

    var difs = difficultyValues();
    var difSel = els.difficulty;
    var wasD = difSel.value;
    difSel.innerHTML =
      '<option value="all">All difficulties</option>' +
      ["Easy", "Medium", "Hard"].map(function (d) {
        return difs[d] ? '<option value="' + d + '">' + d + " (" + difs[d] + ")</option>" : "";
      }).join("");
    if (wasD && difs[wasD]) difSel.value = wasD;
    state.difficulty = difSel.value;
  }

  function sum(obj) {
    var t = 0;
    for (var k in obj) t += obj[k];
    return t;
  }

  /* ---------- list ---------- */

  function optionHTML(item) {
    var opts = item.options || {};
    var keys = Object.keys(opts);
    if (!keys.length) return "";
    return (
      '<div class="mt-3 space-y-1.5">' +
      keys.map(function (k) {
        var val = opts[k];
        var body;
        if (item.isOptionsImage && val) {
          body = '<img loading="lazy" src="' + escAttr(val) + '" alt="option ' + escAttr(k) + '" class="max-h-24 rounded border border-slate-200" />';
        } else if (val !== undefined && val !== null) {
          body = '<span class="ml-1.5">' + val + "</span>";
        } else {
          body = "";
        }
        return (
          '<div class="flex items-start text-sm text-slate-700"><span class="shrink-0 font-semibold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 text-xs mt-0.5">' +
          esc(k) + "</span>" + body + "</div>"
        );
      }).join("") +
      "</div>"
    );
  }

  function imageHTML(item) {
    if (!item.images || !item.images.length) return "";
    return (
      '<div class="mt-3 flex flex-wrap gap-2">' +
      item.images.map(function (u) {
        return '<img loading="lazy" src="' + escAttr(u) + '" alt="diagram" class="max-h-56 rounded-lg border border-slate-200" />';
      }).join("") +
      "</div>"
    );
  }

  function badgesHTML(item, n) {
    var b = [];
    b.push({ text: item.qtype || item.typeLabel, cls: "bg-indigo-100 text-indigo-800" });
    if (item.difficulty) {
      var dcls = "bg-slate-100 text-slate-700";
      if (item.difficulty === "Easy") dcls = "bg-emerald-100 text-emerald-800";
      if (item.difficulty === "Medium") dcls = "bg-amber-100 text-amber-800";
      if (item.difficulty === "Hard") dcls = "bg-rose-100 text-rose-800";
      b.push({ text: item.difficulty, cls: dcls });
    }
    if (item.category) b.push({ text: item.category, cls: "bg-sky-100 text-sky-800" });
    if (item.typeLabel) b.push({ text: item.typeLabel, cls: "bg-slate-200 text-slate-600" });
    return (
      '<div class="flex flex-wrap items-center gap-1.5 mb-2">' +
      '<span class="text-xs text-slate-400 font-semibold mr-1">Q' + (n + 1) + "</span>" +
      b.map(function (x) { return '<span class="text-xs font-semibold px-2 py-0.5 rounded-full ' + x.cls + '">' + esc(x.text) + "</span>"; }).join("") +
      "</div>"
    );
  }

  function cardHTML(item, n) {
    var answer = "";
    if (item.hasAnswer) {
      answer =
        '<div class="mt-4 pt-3 border-t border-slate-200">' +
        '<button class="answer-toggle text-sm font-semibold text-indigo-600 hover:text-indigo-800">Show Answer</button>' +
        '<div class="answer-body hidden mt-2 space-y-2">' +
        '<p class="text-sm font-semibold text-emerald-700">Correct answer: ' + esc(item.answer || "") + "</p>" +
        (item.explanation ? '<div class="text-sm text-slate-700 leading-relaxed">' + item.explanation + "</div>" : "") +
        "</div></div>";
    }
    return (
      '<article class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">' +
      badgesHTML(item, n) +
      '<div class="text-[15px] leading-relaxed text-slate-800 qtext">' + item.question + "</div>" +
      optionHTML(item) +
      imageHTML(item) +
      answer +
      "</article>"
    );
  }

  function renderList() {
    var filtered = filterData();
    var total = filtered.length;
    var pages = Math.max(1, Math.ceil(total / state.perPage));
    if (state.page > pages) state.page = pages;
    if (state.page < 1) state.page = 1;

    var start = (state.page - 1) * state.perPage;
    var slice = filtered.slice(start, start + state.perPage);

    els.resultInfo.textContent = total + " question" + (total === 1 ? "" : "s") +
      " in " + subjectLabel() + (state.chapters.size === 1 ? " • " + state.chapters.values().next().value.replace(/^Chapter\s*\d+\s*-\s*/i, "") : "");

    if (!slice.length) {
      els.list.innerHTML = '<div class="text-center text-slate-500 py-16">No questions match your filters.</div>';
    } else {
      els.list.innerHTML = slice.map(cardHTML).join("");
    }

    renderPagination(pages, total);
    typeset();
    window.scrollTo({ top: 0 });
  }

  function renderPagination(pages, total) {
    var box = els.pagination;
    if (pages <= 1) { box.innerHTML = ""; return; }
    var parts = [];
    parts.push(
      '<button data-page="' + (state.page - 1) + '" ' + (state.page === 1 ? "disabled " : "") +
      'class="pg-btn px-3 py-1.5 text-sm font-semibold rounded-lg border ' + (state.page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50") + '">&larr; Prev</button>'
    );

    var lo = Math.max(1, state.page - 3), hi = Math.min(pages, state.page + 3);
    if (lo > 1) { parts.push(pageBtn(1)); if (lo > 2) parts.push('<span class="text-slate-400">…</span>'); }
    for (var p = lo; p <= hi; p++) parts.push(pageBtn(p));
    if (hi < pages) { if (hi < pages - 1) parts.push('<span class="text-slate-400">…</span>'); parts.push(pageBtn(pages)); }

    parts.push(
      '<button data-page="' + (state.page + 1) + '" ' + (state.page === pages ? "disabled " : "") +
      'class="pg-btn px-3 py-1.5 text-sm font-semibold rounded-lg border ' + (state.page === pages ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50") + '">Next &rarr;</button>'
    );
    parts.push('<span class="text-xs text-slate-400">' + state.page + " / " + pages + "</span>");
    box.innerHTML = parts.join(" ");
    box.querySelectorAll(".pg-btn[data-page]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var p = parseInt(btn.getAttribute("data-page"), 10);
        if (p >= 1 && p <= pages) { state.page = p; renderList(); }
      });
    });
  }

  function pageBtn(p) {
    return '<button data-page="' + p + '" class="pg-btn px-3 py-1.5 text-sm font-semibold rounded-lg border ' +
      (p === state.page ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white hover:bg-slate-50") + '">' + p + "</button>";
  }

  function typeset() {
    if (window.MathJax && window.MathJax.typesetPromise) {
      MathJax.typesetPromise([els.list]).catch(function () {});
    }
  }

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function escAttr(s) { return esc(s); }

  /* ---------- events ---------- */

  function bindSidebar() {
    els.subjects.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.subject = btn.getAttribute("data-subject");
        state.chapters.clear();
        state.types.clear();
        state.page = 1;
        render();
      });
    });

    els.chapterList.addEventListener("click", function (e) {
      var btn = e.target.closest(".chapter-opt");
      if (!btn) return;
      var ch = btn.getAttribute("data-chapter");
      if (state.chapters.has(ch)) state.chapters.delete(ch);
      else state.chapters.add(ch);
      state.page = 1;
      render();
    });

    els.typeList.addEventListener("click", function (e) {
      var btn = e.target.closest(".type-opt");
      if (!btn) return;
      var t = btn.getAttribute("data-type");
      if (state.types.has(t)) state.types.delete(t);
      else state.types.add(t);
      state.page = 1;
      render();
    });

    if (els.clearChapters) {
      els.clearChapters.addEventListener("click", function () {
        state.chapters.clear();
        state.page = 1;
        render();
      });
    }

    els.category.addEventListener("change", function () {
      state.category = els.category.value;
      state.page = 1;
      render();
    });

    els.difficulty.addEventListener("change", function () {
      state.difficulty = els.difficulty.value;
      state.page = 1;
      render();
    });

    els.search.addEventListener("input", function () {
      state.search = els.search.value;
      state.page = 1;
      render();
    });

    els.list.addEventListener("click", function (e) {
      var btn = e.target.closest(".answer-toggle");
      if (!btn) return;
      var body = btn.nextElementSibling;
      var hidden = body.classList.contains("hidden");
      body.classList.toggle("hidden");
      btn.textContent = hidden ? "Hide Answer" : "Show Answer";
      if (hidden) typeset();
    });

    if (els.filterToggle) {
      els.filterToggle.addEventListener("click", function () {
        els.sidebar.classList.toggle("hidden");
      });
    }
  }

  function render() {
    renderChapters();
    renderTypes();
    renderSelects();
    els.subjects.forEach(function (btn) {
      var on = btn.getAttribute("data-subject") === state.subject;
      btn.classList.toggle("active", on);
    });
    renderList();
  }

  function init() {
    els.subjects = $$(".subject-btn");
    els.sidebar = $("#sidebar");
    els.filterToggle = $("#filter-toggle");
    els.chapterList = $("#chapter-list");
    els.typeList = $("#type-list");
    els.category = $("#category-select");
    els.difficulty = $("#difficulty-select");
    els.search = $("#search-input");
    els.list = $("#question-list");
    els.resultInfo = $("#result-info");
    els.pagination = $("#pagination");
    els.clearChapters = $("#clear-chapters");

    bindSidebar();
    render();

    var math = DATA.filter(function (q) { return q.subject === "math"; }).length;
    var phy = DATA.filter(function (q) { return q.subject === "phy"; }).length;
    $("#count-label").textContent = math + " Maths + " + phy + " Physics questions";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();