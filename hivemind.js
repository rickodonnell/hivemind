(function($) {

  const namedHtmlColors = [
    "indianred", "lightcoral", "salmon", "darksalmon", "lightsalmon", "crimson", "red", "firebrick", "darkred", "pink",
    "lightpink", "hotpink", "deeppink", "mediumvioletred", "palevioletred", "orange", "coral", "tomato", "orangered",
    "darkorange", "gold", "yellow", "lightyellow", "lemonchiffon", "lightgoldenrodyellow", "papayawhip", "moccasin",
    "peachpuff", "palegoldenrod", "khaki", "darkkhaki", "lavender", "thistle", "plum", "violet", "orchid", "fuchsia",
    "magenta", "mediumorchid", "mediumpurple", "rebeccapurple", "blueviolet", "darkviolet", "darkorchid", "darkmagenta",
    "purple", "indigo", "slateblue", "darkslateblue", "mediumslateblue", "greenyellow", "chartreuse", "lawngreen",
    "lime", "limegreen", "palegreen", "lightgreen", "mediumspringgreen", "springgreen", "mediumseagreen", "seagreen",
    "forestgreen", "green", "darkgreen", "yellowgreen", "olivedrab", "olive", "darkolivegreen", "mediumaquamarine",
    "darkseagreen", "lightseagreen", "darkcyan", "teal", "aqua", "cyan", "lightcyan", "paleturquoise", "aquamarine",
    "turquoise", "mediumturquoise", "darkturquoise", "cadetblue", "steelblue", "lightsteelblue", "powderblue",
    "lightblue", "skyblue", "lightskyblue", "deepskyblue", "dodgerblue", "cornflowerblue", "mediumslateblue",
    "royalblue", "blue", "mediumblue", "darkblue", "navy", "midnightblue", "cornsilk", "blanchedalmond", "bisque",
    "navajowhite", "wheat", "burlywood", "tan", "rosybrown", "sandybrown", "goldenrod", "darkgoldenrod", "peru",
    "chocolate", "saddlebrown", "sienna", "brown", "maroon", "white", "snow", "honeydew", "mintcream", "azure",
    "aliceblue", "ghostwhite", "whitesmoke", "seashell", "beige", "oldlace", "floralwhite", "ivory", "antiquewhite",
    "linen", "lavenderblush", "mistyrose", "gainsboro", "lightgray", "silver", "darkgray", "gray", "dimgray",
    "lightslategray", "slategray", "darkslategray", "black"
  ];

  const preferredColors = [
    "#0000FF", "#008000", "#FFA500", "#FF0000", "#FFFFFF", // blue, green, orange, red, white
    "#FF69B4", "#FF7F50", "#FFFF00", "#DA70D6", "#00FFFF", // hotpink, coral, yellow, orchid, aqua
    "#00FF00", "#00BFFF", "#9932CC", "#F4A460",            // lime, deepskyblue, darkorchid, sandybrown
    "#00FA9A", "#D2691E", "#FA8072"                        // mediumspringgreen, chocolate, salmon
  ];

  const soundSrcs = {
    bees: [ "bee.mp3" ],
    down: [
      "down-aycaramba.wav", "down-balderdash.wav", "down-bartlaughs.wav", "down-bugsadios.wav",
      "down-bugsleftturn.wav", "down-cantbehappening.wav", "down-disgrace.wav", "down-failed.wav",
      "down-flush.wav", "down-gasp.wav", "down-haha.wav", "down-homerdoh.wav", "down-marvin.wav",
      "down-noworries.wav", "down-quityourbellyachin.wav", "down-slidewhistle1.wav",
      "down-slidewhistle2.mp3", "down-spicymeatball.wav", "down-sufferin.wav", "down-whahwhah.wav",
      "down-yosemite.wav"
    ],
    up: [
      "up-applause.wav", "up-daffydidntthink.wav", "up-excellent.wav", "up-fanfare1.wav",
      "up-fanfare2.wav", "up-giddyup.wav", "up-hotdiggety.wav", "up-margemiracle.wav",
      "up-nedmiracle.wav", "up-special.wav"
    ],
    dice: [ "dice.wav" ]
  };
  const sounds = { bees: [], down: [], up: [], dice: [] };


  let quickStartRow = 0;

  const levelTops = [ 55, 130, 200, 290, 375, 495 ];
  const midPt = 280;
  const beeWd = [80, 70, 64, 58, 52, 50, 48, 46];

  const flowerBeePos = [[[]], [[ 64, 76]], [[64, 50], [64, 103]], [[42, 76], [90, 51], [90, 102]]];

  const playerTpl = `
    <div class="player" data-toggle="popover">
      <div class="color"></div>
      <div class="bee"></div>
      <div class="name"></div>
    </div>
  `;

  const flowerDwellerTpl = `
    <div class="flower-dweller">
      <div class="color"></div>
      <div class="bee"></div>
    </div>
  `;

  const honeypotTpl = '<div class="honeypot"></div>';

  const popoverTpl = id => `
    <div class="pop" id="pop-${id}">
      <i class='bee-ctl bee-dn fas fa-arrow-alt-circle-down'></i>
      <i class='bee-ctl bee-up fas fa-arrow-alt-circle-up'></i>
      <i class='bee-ctl bee-rm fas fa-trash-alt'></i>
    </div>
  `;

  const formRowTpl = (num, color) => `
    <div class="form-row player-data">
      <div class="col-sm-3 label">Player</div>
      <div class="col-sm-4"><input class="form-control" type="text" name="nm"></div>
      <div class="col-sm-2"><input class="form-control" type="color" name="color" value="${color}"></div>
      <div class="col-sm-2"><input class="form-control" type="number" min="1" max="6" name="level" value="1"></div>
      <div class="col-sm-1"><button type="button" class="btn btn-danger qs-delete"> - </button></div>
    </div>
  `;

  const options = {
    nameClass: 'below-tail', // none, on-head or below-tail
    activeBees: true,
    soundOn: true
  };

  const players = [];

  let lastClickedPlayer = '';
  let upArrowHeld = false;
  let downArrowHeld = false;

  // "Private" methods
  const cleanString = str => str.toLowerCase().replace(/[^a-z0-9]/g, "");

  const isNameTaken = str => !!players.find(p => cleanString(p.name) === cleanString(str));
  const isColorTaken = str => !!players.find(p => p.color === str);

  const redistributeLevel = lvl => {
    const lvlPlyrs = players.filter(p => p.level === lvl);
    const n = lvlPlyrs.length;
    for (let i = 0; i < n; i++) {
      const start = midPt - n * beeWd[Math.min(n - 1, beeWd.length - 1)] / 2;
      const left = start + i * beeWd[Math.min(n - 1, beeWd.length - 1)];
      $("#plyr-" + cleanString(lvlPlyrs[i].name)).animate({ left: left + "px" }, 750);
    }
  };

  let soundsLoaded = false;
  const loadSounds = () => {
    if (soundsLoaded) return;
    for (const soundType in soundSrcs) {
      for (const soundSrc of soundSrcs[soundType]) {
        sounds[soundType].push( new Howl({ src: [ `./sound/${soundSrc}` ] }) );
      }
    }
    soundsLoaded = true;
  };
  const playRandomSound = (type, loop) => {
    const randomSound = sounds[type][getRndInt(sounds[type].length)];
    if (loop) randomSound.loop(true);
    randomSound.play();
    return randomSound;
  };

  const rollDice = () => {
    let numPips = 1;
    $(".die-face").addClass("shakey");
    const diceSound = soundsLoaded ? playRandomSound("dice", true) : null;
    if (soundsLoaded) playRandomSound("dice", true);
    const newNumInterval = window.setInterval(() => {
      $(".die-face").empty();
      numPips = getRndInt(6);
      for (let i = 0; i <= numPips; i++) {
        $(".die-face").append('<span class="pip"></span>');
      }
    }, 100);
    return new Promise(resolve => {
      window.setTimeout(() => {
        $(".die-face").removeClass("shakey");
        if (!!diceSound) diceSound.stop();
        window.clearInterval(newNumInterval);
        resolve(numPips + 1); // zero based random number, this value will be what the die shows
      }, 1500);
    });
  };

  // Number passed in here should be 0=honeypot, 1=1bee, 2=2bees, 3=3bees
  const populateFlower = (num) => {
    console.log('flower population', num);
    $(".flower").empty();
    if (num === 0) {
      $(".flower").append(honeypotTpl);
    } else {
      for (let i = 0; i < num; i++) {
        $flowerDweller = $(flowerDwellerTpl);
        const top = flowerBeePos[num][i][0];
        const left = flowerBeePos[num][i][1];
        $flowerDweller.css({ top: top + "px", left: left + "px" });
        $flowerDweller.find(".color").css("background-color", preferredColors[getRndInt(17)]);
        $(".flower").append($flowerDweller);
      }
    }
  };

  const getRndInt = max => Math.floor(Math.random() * max);  // returns 0 to max-1

  // Public functions
  window.hm = {

    prepGame: () => {
      // Load sounds - can't be loaded until user interacts with page
      $(document).on("click", () => { loadSounds() });

      // Set up Control Features
      $(document).on("click", "#addPlayerSave", function(e) {
        hm.addPlayer($('#nm').val(), $('#color').val(), $('#level').val());
      });
      $(document).on("click", "#quickStart .qs-add", function(e) {
        hm.addFormRowToQuickstart();
      });
      $(document).on("click", "#quickStart .qs-delete", function(e) {
        hm.removeFormRowFromQuickstart(e);
      });
      $(document).on("click", "#quickStartSave", function(e) {
        hm.addAllFromQuickstart();
      });
      $(document).on("click", "#saveOptions", function(e) {
        hm.saveOptions();
      });

      // Set up bee controls
      $(document).on("click", ".bee-ctl", function(e) {
        const $fa = $(e.currentTarget);
        const plyrId = $fa.parents('.pop').attr('id').replace("pop", "plyr");
        if ($fa.hasClass('bee-rm')) {
          $("#"+plyrId).popover('dispose');
          hm.removePlayer(plyrId);
        } else if ($fa.hasClass('bee-up')) {
          $("#"+plyrId).popover('hide');
          hm.bumpPlayer(plyrId, "up");
        } else if ($fa.hasClass('bee-dn')) {
          $("#"+plyrId).popover('hide');
          hm.bumpPlayer(plyrId, "down");
        }
      });
      $(document).on("click", ".player", function(e) {
        const plyrId = e.currentTarget.id;
        if (upArrowHeld) {
          $("#"+plyrId).popover('hide');
          hm.bumpPlayer(plyrId, "up");
        } else if (downArrowHeld) {
          $("#"+plyrId).popover('hide');
          hm.bumpPlayer(plyrId, "down");
        } else {
          hm.trackLastClickedPlayer(plyrId);
        }
      });
      $(document).on("dblclick", ".player", function(e) {
        $("#"+e.currentTarget.id).popover('dispose');
        hm.removePlayer(e.currentTarget.id);
      });
      $(window).keydown(evt => {
        if (evt.which === 38) upArrowHeld = true;
        if (evt.which === 40) downArrowHeld = true;
      });
      $(window).keyup(evt => {
        if (evt.which === 38) upArrowHeld = false;
        if (evt.which === 40) downArrowHeld = false;
      });

      // Die controls
      $(document).on("click", ".die-face", function(e) {
        rollDice().then(res => {
          populateFlower(getRndInt(4));
        });
      });

      hm.shakeRandomBee();
      hm.addFormRowToQuickstart();
      hm.addFormRowToQuickstart();
      hm.addFormRowToQuickstart();
    },

    saveOptions: () => {
      const prevOptions = $.extend({}, options);
      options.nameClass = $("#nameLocation").val();
      options.activeBees = $("#isActive").is(":checked");
      options.soundOn = $("#soundOn").is(":checked");
      // reset all bees in case this is changed mid-game
      $(".player .name").removeClass(prevOptions.nameClass).addClass(options.nameClass);
      $('#optionsModal').modal('hide');
    },

    addPlayer: (name, color, level) => {
      const lvl = parseInt(level);
      if (!name || !color || !level) {
        console.warn("Incomplete player data.");
        return;
      }
      if (isNameTaken(name)) {
        console.warn("That name is too close to another player's name.");
        return;
      }
      players.push({ name, color, level: lvl });
      const $hive = $("#hive");
      $player = $(playerTpl);
      $player.attr("id", "plyr-" + cleanString(name));
      $player.css({ top: levelTops[level - 1] + "px", left: "10px" });
      $player.find(".color").css("background-color", color);
      $player.find(".name").addClass(options.nameClass).text(name);
      $hive.append($player);
      $('[data-toggle="popover"]').popover({
        placement: 'bottom', content: popoverTpl(cleanString(name)), html: true
      });
      redistributeLevel(lvl);
      $('#addPlayer').modal('hide');
    },

    removePlayer: playerId => {
      $("#" + playerId).remove();
      const plyr = players.find(p => cleanString(p.name) === playerId.substr(5));
      const lvl = plyr.level;
      players.splice(players.indexOf(plyr), 1);
      redistributeLevel(lvl);
    },

    bumpPlayer: (playerId, dir) => {
      const plyr = players.find(p => cleanString(p.name) === playerId.substr(5));
      const oldLvl = plyr.level;
      plyr.level = dir === "up" ? Math.max(plyr.level - 1, 1) : Math.min(plyr.level + 1, 6);
      $("#" + playerId).animate({ top: levelTops[plyr.level - 1] + "px" }, 750);
      if (options.soundOn) playRandomSound(dir);
      redistributeLevel(oldLvl);
      redistributeLevel(plyr.level);
    },

    shakeRandomBee: () => {
      if (options.activeBees) {
        // Fire up another one right away
        const waitPeriod = (Math.random()*4 + 2) * 1000; // 2 to 6 seconds
        setTimeout(() => { hm.shakeRandomBee(); }, waitPeriod);
        // Then do this one
        const randomPlyr = players[Math.floor(Math.random() * players.length)];
        if (!!randomPlyr) {
          const id = "#plyr-" + cleanString(randomPlyr.name);
          if (!$(id).hasClass("shakey")) { // dont shake if already shaking
            const duration = (Math.random()*2 + 0.1) * 1000; // 0.1 to 2.1 seconds
            $(id).addClass("shakey");
            let randomSound = null;
            if (options.soundOn && soundsLoaded) {
              randomSound = playRandomSound("bees");
            }
            setTimeout(() => {
              $(id).removeClass("shakey");
              if (soundsLoaded && !!randomSound) randomSound.stop();
            }, duration);
          }
        }
      }
    },

    addFormRowToQuickstart: () => {
      $("#quickStart .form-group").append(formRowTpl(quickStartRow, preferredColors[quickStartRow++]));
    },

    removeFormRowFromQuickstart: e => {
      $(e.target).parents(".form-row").remove();
    },

    addAllFromQuickstart: () => {
      $("#quickStart .form-group .player-data").each((i, e) => {
        const nm = $(e).find("input[name='nm']").val();
        const clr = $(e).find("input[name='color']").val();
        const lvl = $(e).find("input[name='level']").val();
        if (!nm || !clr || !lvl) {
          console.warn("Skipping an incomplete row.");
        } else {
          hm.addPlayer(nm, clr, lvl);
        }
      });
      $('#quickStart').modal('hide');
    },

    trackLastClickedPlayer: id => {
      lastClickedPlayer = id;
    }

  };

})(jQuery);
