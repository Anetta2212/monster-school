(function () {
  "use strict";

  var ORDER = ["ghost", "witch", "vampire", "monster"];

  var CLASSES = {
    ghost: {
      name: "Ghosts",
      motto: "Present, even when absent.",
      desc: "You are calm, observant and a little mysterious. People notice you only when the temperature drops, and you like it that way.",
      periods: ["Haunting Basics", "Chain Rattling and Music", "Walls 101: Through and Around"],
      teacher: "Professor Whisper",
      teacherLine: "Has taught since 1692 and has never once used the door. Marks attendance by feeling a chill.",
      rule: "No walking through walls during tests. Use the door like everyone else.",
      factTitle: "Dark American fact",
      fact: "Legend says Sarah Winchester kept adding rooms to her mansion in San Jose, California, to confuse restless spirits. The Winchester Mystery House has about 160 rooms."
    },
    witch: {
      name: "Witches",
      motto: "Curious minds make the best spells.",
      desc: "You are clever, creative and always one step ahead. You read the instructions, then improve the recipe.",
      periods: ["Potions and Herbology", "Broomstick Flying", "Spelling (yes, the magic kind)"],
      teacher: "Madame Hex",
      teacherLine: "Grades essays with a raven feather and tests every answer in a cauldron. Allergic to excuses.",
      rule: "Brooms must be parked in the bicycle rack. A broom on the ceiling means detention.",
      factTitle: "Dark American fact",
      fact: "In 1692 the Salem witch trials in Massachusetts began. Around 200 people were accused and 20 were executed."
    },
    vampire: {
      name: "Vampires",
      motto: "Always elegant, always after dark.",
      desc: "You are charming, stylish and a night owl by nature. You have excellent manners and a very long memory.",
      periods: ["Night Studies (maths after midnight)", "Eternal Style and Etiquette", "Garlic Avoidance, Practical"],
      teacher: "Dr. Velvet Nocturne",
      teacherLine: "Only teaches after sunset. Every lesson starts at midnight and nobody dares to be late.",
      rule: "Selfies are optional. Reflections are impossible, so please stop asking for the mirror.",
      factTitle: "Dark American fact",
      fact: "In 1892 in Exeter, Rhode Island, villagers dug up Mercy Brown, who had died of tuberculosis, because they feared she was a vampire."
    },
    monster: {
      name: "Monsters",
      motto: "Big feet. Bigger heart.",
      desc: "You are loud, strong and loyal. You look scary, but you are the first to help a friend in trouble.",
      periods: ["Roaring and Stomping", "Hiding Under Beds, Practical", "Cooking for Giants"],
      teacher: "Coach Grumble",
      teacherLine: "Has bolts in his neck and a whistle that has already broken three windows.",
      rule: "No roaring in the library. Roaring is allowed in the gym only, and only before noon.",
      factTitle: "Dark American fact",
      fact: "In 1966 and 1967, people in Point Pleasant, West Virginia, reported a huge winged creature with glowing red eyes. They called it Mothman."
    }
  };

  var QUESTIONS = [
    { q: "It is your first day at the new school. When do you arrive?", a: [
      ["Before everyone else, with the morning mist.", "ghost"],
      ["Exactly when the bell rings. I checked the stars first.", "witch"],
      ["After sunset. Daylight is not a good look for me.", "vampire"],
      ["Late. The door was in my way.", "monster"] ] },
    { q: "Which subject do you sign up for first?", a: [
      ["The History of Things Left Unfinished", "ghost"],
      ["Potions and Herbology", "witch"],
      ["Eternal Style and Etiquette", "vampire"],
      ["Physical Education: Stomping and Roaring", "monster"] ] },
    { q: "Lunch break. What is on your tray?", a: [
      ["Nothing. I just watch the others eat.", "ghost"],
      ["Soup. Do not ask what is in it.", "witch"],
      ["Tomato juice. Probably tomato.", "vampire"],
      ["Everything. And your sandwich too.", "monster"] ] },
    { q: "Where do you sit in the classroom?", a: [
      ["By the window, where the cold air gathers.", "ghost"],
      ["Next to the bookshelf, with a spellbook under the desk.", "witch"],
      ["In the shadows, far from the windows.", "vampire"],
      ["On the floor. The chairs cannot hold me.", "monster"] ] },
    { q: "The teacher announces a surprise test. What do you do?", a: [
      ["Fade through the wall and think about it.", "ghost"],
      ["Check my spellbook. Quickly.", "witch"],
      ["Smile politely and charm the teacher.", "vampire"],
      ["Panic loudly. The desk will not survive.", "monster"] ] },
    { q: "Which school rule would you break first?", a: [
      ["No walking through walls.", "ghost"],
      ["No magic in the corridors.", "witch"],
      ["No sleeping in class.", "vampire"],
      ["No stomping in the corridors.", "monster"] ] },
    { q: "Pick your after-school club.", a: [
      ["Seance and Storytelling Club", "ghost"],
      ["Broomstick Racing Team", "witch"],
      ["Gothic Poetry Society", "vampire"],
      ["Football Team (nobody dares to tackle me)", "monster"] ] },
    { q: "How would your classmates describe you?", a: [
      ["Quiet, mysterious and strangely cold.", "ghost"],
      ["Clever, curious and a bit sneaky.", "witch"],
      ["Charming, elegant and a little dangerous.", "vampire"],
      ["Loud, strong and secretly very kind.", "monster"] ] }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var intro = $("intro"), quiz = $("quiz"), result = $("result");
  var optionsEl = $("options"), questionEl = $("question"), countEl = $("count");
  var progressEl = $("progress"), backBtn = $("back"), note = $("note"), fallback = $("fallback");

  var idx = 0, answers = [], shown = [], locked = false, lastKey = "ghost";
  var resultKey = null, inProgress = false, STORE = "soh-answers";
  var rules = $("rules"), tabResult = $("tabResult"), homeStamp = $("homeStamp"), homeNote = $("homeNote");
  var startBtn = $("start"), viewBtn = $("viewResult");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function show(which) {
    intro.hidden = which !== "intro";
    quiz.hidden = which !== "quiz";
    result.hidden = which !== "result";
    rules.hidden = which !== "rules";
    var tabOf = which === "quiz" ? "intro" : which;
    document.querySelectorAll(".tab").forEach(function (t) {
      if (t.getAttribute("data-go") === tabOf) t.setAttribute("aria-current", "page");
      else t.removeAttribute("aria-current");
    });
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  function updateHome() {
    var has = !!resultKey;
    var c = has ? CLASSES[resultKey] : null;
    homeStamp.textContent = has ? "Admitted: " + c.name : "Enrollment pending";
    homeStamp.className = "stamp" + (has ? " ok" : "");
    if (has) homeStamp.setAttribute("data-k", resultKey); else homeStamp.removeAttribute("data-k");
    viewBtn.hidden = !has;
    startBtn.className = has ? "btn ghost" : "btn";
    startBtn.textContent = inProgress ? "Continue the exam" : has ? "Retake the exam" : "Begin the entrance exam";
    homeNote.textContent = has
      ? "Your student ID is waiting for you. If you retake the exam, the old ID stays until you finish the new one."
      : "It takes about two minutes. There are no wrong answers, only dangerous ones.";
    tabResult.hidden = !has;
  }

  function updateRules() {
    var box = $("rulesClass");
    if (!resultKey) { box.hidden = true; return; }
    var c = CLASSES[resultKey];
    box.setAttribute("data-k", resultKey);
    $("rulesClassLabel").textContent = "Extra rule for the class of " + c.name;
    $("rulesClassText").textContent = c.rule;
    box.hidden = false;
  }

  function go(name) {
    if (name === "result" && !resultKey) name = "intro";
    if (name === "intro") updateHome();
    if (name === "rules") updateRules();
    show(name);
  }

  function buildProgress() {
    progressEl.textContent = "";
    for (var i = 0; i < QUESTIONS.length; i++) {
      var s = document.createElement("span");
      s.className = "stone" + (i < idx ? " done" : i === idx ? " now" : "");
      progressEl.appendChild(s);
    }
  }

  function renderQuestion() {
    locked = false;
    var item = QUESTIONS[idx];
    questionEl.textContent = item.q;
    countEl.textContent = "Question " + (idx + 1) + " of " + QUESTIONS.length;
    backBtn.disabled = idx === 0;
    buildProgress();
    shown = shuffle(item.a);
    optionsEl.textContent = "";
    shown.forEach(function (opt, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "opt" + (answers[idx] === opt[1] ? " picked" : "");
      var k = document.createElement("span");
      k.className = "key";
      k.textContent = "ABCD".charAt(i);
      var t = document.createElement("span");
      t.textContent = opt[0];
      b.appendChild(k);
      b.appendChild(t);
      b.addEventListener("click", function () { choose(i); });
      li.appendChild(b);
      optionsEl.appendChild(li);
    });
    if (!reduce) {
      quiz.classList.remove("rise");
      void quiz.offsetWidth;
      quiz.classList.add("rise");
    }
    try { questionEl.focus({ preventScroll: true }); } catch (e) {}
  }

  function choose(i) {
    if (locked || !shown[i]) return;
    locked = true;
    inProgress = true;
    answers[idx] = shown[i][1];
    var btns = optionsEl.querySelectorAll(".opt");
    for (var n = 0; n < btns.length; n++) {
      btns[n].disabled = true;
      btns[n].classList.toggle("picked", n === i);
    }
    setTimeout(function () {
      var visible = !quiz.hidden;
      if (idx < QUESTIONS.length - 1) { idx++; if (visible) renderQuestion(); }
      else { finish(visible); }
    }, reduce ? 120 : 380);
  }

  function score(ans) {
    var counts = { ghost: 0, witch: 0, vampire: 0, monster: 0 };
    ans.forEach(function (k) { counts[k]++; });
    var max = Math.max(counts.ghost, counts.witch, counts.vampire, counts.monster);
    var tied = ORDER.filter(function (k) { return counts[k] === max; });
    var winner = tied[0];
    if (tied.length > 1) {
      for (var i = ans.length - 1; i >= 0; i--) {
        if (tied.indexOf(ans[i]) !== -1) { winner = ans[i]; break; }
      }
    }
    return { counts: counts, winner: winner };
  }

  function renderResult(r) {
    lastKey = r.winner;
    resultKey = r.winner;
    var c = CLASSES[r.winner];
    result.setAttribute("data-k", r.winner);
    $("rcrest").setAttribute("href", "#crest-" + r.winner);
    $("rname").textContent = c.name;
    $("rmotto").textContent = c.motto;
    $("rdesc").textContent = c.desc;
    $("rteacher").textContent = c.teacher;
    $("rteacherline").textContent = c.teacherLine;
    $("rrule").textContent = c.rule;
    $("rfacttitle").textContent = c.factTitle;
    $("rfact").textContent = c.fact;

    var table = $("rtable");
    table.textContent = "";
    c.periods.forEach(function (p, i) {
      var li = document.createElement("li");
      var s = document.createElement("span");
      s.className = "slot";
      s.textContent = "Period " + (i + 1);
      var t = document.createElement("span");
      t.textContent = p;
      li.appendChild(s); li.appendChild(t);
      table.appendChild(li);
    });

    var sc = $("rscores");
    sc.textContent = "";
    ORDER.slice().sort(function (a, b) { return r.counts[b] - r.counts[a]; }).forEach(function (k) {
      var row = document.createElement("div");
      row.className = "score";
      row.setAttribute("data-k", k);
      var l = document.createElement("span");
      l.className = "slot";
      l.textContent = CLASSES[k].name;
      var track = document.createElement("div");
      track.className = "track";
      var fill = document.createElement("div");
      fill.className = "fill";
      fill.style.setProperty("--k", "var(--c)");
      fill.style.width = Math.round((r.counts[k] / QUESTIONS.length) * 100) + "%";
      track.appendChild(fill);
      var n = document.createElement("span");
      n.className = "num";
      n.textContent = r.counts[k] + "/" + QUESTIONS.length;
      row.appendChild(l); row.appendChild(track); row.appendChild(n);
      sc.appendChild(row);
    });

    note.textContent = "";
    fallback.hidden = true;
  }

  function finish(visible) {
    var r = score(answers);
    inProgress = false;
    try { sessionStorage.setItem(STORE, JSON.stringify(answers)); } catch (e) {}
    renderResult(r);
    updateHome();
    if (!visible) return;
    show("result");
    if (!reduce) {
      result.classList.remove("rise");
      void result.offsetWidth;
      result.classList.add("rise");
    }
  }

  function copyText(t) {
    var done = function () { note.textContent = "Copied. Paste it in the class chat."; fallback.hidden = true; };
    var manual = function () {
      fallback.hidden = false;
      fallback.value = t;
      try { fallback.focus(); fallback.select(); } catch (e) {}
      note.textContent = "Select and copy the text above.";
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(done, manual);
        return;
      }
    } catch (e) {}
    manual();
  }

  function startExam() {
    idx = 0; answers = []; inProgress = false;
    show("quiz");
    renderQuestion();
  }
  startBtn.addEventListener("click", function () {
    if (inProgress) { show("quiz"); renderQuestion(); }
    else { startExam(); }
  });
  viewBtn.addEventListener("click", function () { go("result"); });
  backBtn.addEventListener("click", function () {
    if (idx > 0 && !locked) { idx--; renderQuestion(); }
  });
  $("again").addEventListener("click", startExam);
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () { go(b.getAttribute("data-go")); });
  });
  $("copy").addEventListener("click", function () {
    var c = CLASSES[lastKey];
    copyText("I took the School of Horror entrance exam and I am in the class of " + c.name + ". \"" + c.motto + "\" Dark Friday, 30.10.");
  });

  document.addEventListener("keydown", function (e) {
    if (quiz.hidden || locked || e.ctrlKey || e.metaKey || e.altKey) return;
    var n = "1234".indexOf(e.key);
    var l = "abcd".indexOf(e.key.toLowerCase());
    var i = n > -1 ? n : l;
    if (e.key.length === 1 && i > -1) choose(i);
  });

  try {
    var saved = JSON.parse(sessionStorage.getItem(STORE) || "null");
    if (Array.isArray(saved) && saved.length === QUESTIONS.length && saved.every(function (k) { return ORDER.indexOf(k) > -1; })) {
      renderResult(score(saved));
    }
  } catch (e) {}
  updateHome();
  show("intro");
})();
