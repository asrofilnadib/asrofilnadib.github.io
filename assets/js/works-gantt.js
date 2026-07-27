/**
 * Works Timeline — Highcharts Gantt
 * Bars = consecutive commit days; diamonds = single-day milestones.
 */
(function () {
  "use strict";

  var COLORS = [
    "#8750f7",
    "#58a6ff",
    "#3fb950",
    "#d29922",
    "#f778ba",
    "#39c5cf",
    "#a371f7",
    "#f85149",
    "#7ee787",
    "#79c0ff",
    "#ffa657",
    "#d2a8ff",
    "#56d4dd",
  ];

  var chart = null;
  var allProjects = null;
  var currentCompany = "all";
  var WRAPPER_MAP = {
    "smart-lab": "smart-lab",
    tms: "tms",
    ecafe: "ecafe",
    "ga-stock": "ga-stock",
    scada: "scada",
    logbook: "logbook",
    p2h: "p2h",
    chatbot: "chatbot",
    kapas: "kapas",
    timbangin: "timbangin",
    prayer: "prayer",
    "kms-form": "kms-form",
    "command-center": "command-center",
    psikotes: "psikotes",
    labqc: "labqc",
    "log-customer": "log",
    checksheet: "checksheet",
    "log-internal": "logqc",
    "pending-qc": "pqc",
    "testing-report": "testing-report",
    "investigation-report": "investigation-report",
    "grace-period": "gp",
    okration: "skripsi",
    kastara: "kastara",
    "sistem-pakar": "sistem_pakar",
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function setStatus(msg, isError) {
    var el = $("#works-gantt-status");
    var host = $("#works-gantt");
    if (!el) return;
    if (!msg) {
      el.classList.remove("is-visible", "is-error");
      el.textContent = "";
      if (host) host.style.display = "";
      return;
    }
    el.textContent = msg;
    el.classList.add("is-visible");
    el.classList.toggle("is-error", !!isError);
    if (host) host.style.display = "none";
  }

  function companyFromFilter(filter) {
    if (!filter || filter === "*") return "all";
    return String(filter).replace(/^\./, "").toLowerCase();
  }

  function parseDay(day) {
    return Date.parse(day + "T00:00:00+07:00");
  }

  function endExclusive(day) {
    return parseDay(day) + 24 * 60 * 60 * 1000;
  }

  function formatRange(start, end) {
    if (start === end) return start;
    return start + " → " + end;
  }

  function filterProjects(company) {
    var list = allProjects || [];
    if (!company || company === "all") return list;
    return list.filter(function (p) {
      return String(p.company || "").toLowerCase() === company;
    });
  }

  function buildSeries(projects) {
    var categories = projects.map(function (p) {
      return p.title;
    });
    var data = [];

    projects.forEach(function (project, y) {
      var color = COLORS[y % COLORS.length];
      (project.segments || []).forEach(function (seg) {
        var point = {
          name: project.title,
          y: y,
          projectKey: project.key,
          company: project.company,
          color: color,
          commits: seg.commits,
          startLabel: seg.start,
          endLabel: seg.end,
          start: parseDay(seg.start),
          end: endExclusive(seg.end),
          milestone: !!seg.milestone,
        };
        if (seg.milestone) {
          point.marker = {
            symbol: "diamond",
            radius: 7,
            lineWidth: 0,
            fillColor: color,
          };
        }
        data.push(point);
      });
    });

    return { categories: categories, data: data };
  }

  function renderChart(company) {
    if (!window.Highcharts || typeof window.Highcharts.ganttChart !== "function") {
      setStatus("Highcharts Gantt failed to load.", true);
      return;
    }

    var filtered = filterProjects(company).filter(function (p) {
      return p.segments && p.segments.length;
    });

    if (!filtered.length) {
      setStatus("No commit activity found for this filter yet.");
      if (chart) {
        chart.destroy();
        chart = null;
      }
      return;
    }

    setStatus("");
    var built = buildSeries(filtered);
    var height = Math.max(360, 64 + filtered.length * 36);

    if (chart) {
      chart.destroy();
      chart = null;
    }

    chart = Highcharts.ganttChart("works-gantt", {
      chart: {
        backgroundColor: "transparent",
        height: height,
        style: { fontFamily: "Sora, sans-serif" },
        spacingBottom: 8,
      },
      title: { text: null },
      credits: { enabled: false },
      exporting: { enabled: false },
      scrollbar: { enabled: false },
      navigator: { enabled: false },
      rangeSelector: { enabled: false },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: "rgba(18, 16, 26, 0.96)",
        borderColor: "rgba(135, 80, 247, 0.45)",
        borderRadius: 10,
        style: { color: "#e6edf3", fontSize: "12px" },
        formatter: function () {
          var p = this.point;
          var kind = p.milestone ? "Single day" : "Consecutive days";
          return (
            "<b>" +
            p.name +
            "</b><br/>" +
            kind +
            "<br/>" +
            formatRange(p.startLabel, p.endLabel) +
            "<br/>" +
            p.commits +
            " commit" +
            (p.commits === 1 ? "" : "s")
          );
        },
      },
      xAxis: [
        {
          currentDateIndicator: false,
          grid: { borderColor: "#30363d", enabled: true },
          labels: { style: { color: "#8b949e", fontSize: "11px" } },
          lineColor: "#30363d",
          tickColor: "#30363d",
        },
        {
          labels: { style: { color: "#c9d1d9", fontSize: "12px", fontWeight: "600" } },
          grid: { borderColor: "#30363d" },
          lineColor: "#30363d",
        },
      ],
      yAxis: {
        type: "category",
        categories: built.categories,
        uniqueNames: true,
        staticScale: 36,
        labels: {
          style: { color: "#e6edf3", fontSize: "12px", fontWeight: "600" },
        },
        grid: {
          borderColor: "#30363d",
          enabled: true,
        },
      },
      plotOptions: {
        series: {
          borderRadius: 6,
          borderColor: "transparent",
          dataLabels: { enabled: false },
          cursor: "pointer",
          point: {
            events: {
              click: function () {
                focusProject(this.projectKey);
              },
            },
          },
        },
        gantt: {
          borderRadius: 6,
        },
      },
      series: [
        {
          name: "Activity",
          data: built.data,
          borderRadius: 6,
        },
      ],
    });
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_\-]/g, "\\$&");
  }

  function focusProject(projectKey) {
    if (!projectKey) return;
    var wrap = WRAPPER_MAP[projectKey] || projectKey;
    var btn = document.querySelector('[data-mfp-src="#portfolio-wrapper-' + cssEscape(wrap) + '"]');
    if (!btn) return;
    var card = btn.closest(".portfolio-item");
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("works-gantt-flash");
    setTimeout(function () {
      card.classList.remove("works-gantt-flash");
    }, 1200);
  }

  async function loadActivity() {
    setStatus("Loading timeline…");
    try {
      var res = await fetch("/api/activity?company=all");
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to load activity");
      allProjects = data.projects || [];
      renderChart(currentCompany);
    } catch (err) {
      console.warn(err);
      setStatus(String(err.message || err), true);
    }
  }

  function applyCompany(company) {
    currentCompany = company || "all";
    if (!allProjects) return;
    renderChart(currentCompany);
  }

  function bindFilters() {
    document.querySelectorAll(".filter-button-group button[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyCompany(companyFromFilter(btn.getAttribute("data-filter")));
      });
    });
  }

  function boot() {
    if (!$("#works-gantt")) return;
    bindFilters();
    loadActivity();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
