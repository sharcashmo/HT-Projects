"use strict";
var folder = "./fhetoky-t75/";
var chart;
const chartElements = 16;
const intervalTime = 1000;

$(document).ready(function () {
  fetch("./fhetoky-t75/data.json", { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => startEpoch(data))
    .catch((error) => console.error("Unable to fetch data:", error));
});

function levelDenomination(n) {
  let denominations = [
    "nulo",
    "desastroso",
    "horrible",
    "pobre",
    "débil",
    "insuficiente",
    "aceptable",
    "bueno",
    "excelente",
    "formidable",
    "destacado",
    "brillante",
    "magnífico",
    "clase mundial",
    "sobrenatural",
    "titánico",
    "extraterrestre",
    "mítico",
    "mágico",
    "utópico",
    "divino",
  ];

  return denominations[n];
}

/* thousandSeparator */
function ts(number) {
  return String(number).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, "$1 ");
}

function htms(weeklyData) {
  let htmsGK = [
    0, 2, 12, 23, 39, 56, 76, 99, 123, 150, 183, 222, 268, 321, 380, 446, 519,
    600, 691, 797, 924,
  ];
  let htmsDef = [
    0, 4, 18, 39, 65, 98, 134, 175, 221, 271, 330, 401, 484, 580, 689, 809, 942,
    1092, 1268, 1487, 1791,
  ];
  let htmsPM = [
    0, 4, 17, 34, 57, 84, 114, 150, 190, 231, 281, 341, 412, 493, 584, 685, 798,
    924, 1070, 1247, 1480,
  ];
  let htmsWg = [
    0, 2, 12, 25, 41, 60, 81, 105, 132, 161, 195, 238, 287, 344, 407, 478, 555,
    642, 741, 855, 995,
  ];
  let htmsPs = [
    0, 3, 14, 31, 51, 75, 104, 137, 173, 213, 259, 315, 381, 457, 540, 634, 738,
    854, 988, 1148, 1355,
  ];
  let htmsSc = [
    0, 4, 17, 36, 59, 88, 119, 156, 197, 240, 291, 354, 427, 511, 607, 713, 830,
    961, 1114, 1300, 1547,
  ];
  let htmsSP = [
    0, 1, 2, 5, 9, 15, 21, 28, 37, 46, 56, 68, 81, 95, 112, 131, 153, 179, 210,
    246, 287,
  ];
  var htms28Age = [
    1641, 1481, 1323, 1166, 1011, 858, 708, 560, 416, 274, 136, 0, -129, -255,
    -378, -497, -614, -727, -837,
  ];

  let htms =
    htmsGK[weeklyData.KeeperSkill] +
    htmsDef[weeklyData.DefenderSkill] +
    htmsPM[weeklyData.PlaymakerSkill] +
    htmsWg[weeklyData.WingerSkill] +
    htmsPs[weeklyData.PassingSkill] +
    htmsSc[weeklyData.ScorerSkill] +
    htmsSP[weeklyData.SetPiecesSkill];

  let htms28 =
    htms +
    htms28Age[weeklyData.Age - 16] +
    (htms28Age[weeklyData.Age - 17] - htms28Age[weeklyData.Age - 16]) *
      (1 - weeklyData.AgeDays / 112);

  return {
    htms: htms,
    htms28: Math.round(htms28),
  };
}

function speciality(n) {
  let spec = [
    "Sin especialidad",
    "Técnico",
    "Rápido",
    "Potente",
    "Impredecible",
    "Cabeceador",
    "Estoico",
    "Influyente",
  ];

  return spec[n];
}

function setBarColor(bar, level, maxLevel) {
  let names = ["verylow", "low", "high", "veryhigh"];
  let l = Math.trunc((level - 1) / 2);
  bar.width("" + (level * 100) / maxLevel + "%");
  bar.removeClass(names);
  bar.addClass(names[l]);
}

function startEpoch(data) {
  let maxEpoch = data.WeeklyData.length - 1;
  let currentEpoch = 0;
  let interval;

  chartCreate();
  chartAddEpoch(data, currentEpoch);

  $(".back").on("click", function () {
    if (currentEpoch > 0) {
      chartRemoveEpoch(data, currentEpoch);
      currentEpoch--;
    }

    goEpoch(currentEpoch, data);
  });

  $(".next").on("click", function () {
    if (currentEpoch < maxEpoch) {
      currentEpoch++;
      chartAddEpoch(data, currentEpoch);
    }

    goEpoch(currentEpoch, data);
  });

  $(".play").on("click", function () {
    if ($(".play").hasClass("grayed")) {
      clearInterval(interval);
      $(".play").removeClass("grayed");
    } else {
      $(".play").addClass("grayed");

      if (currentEpoch >= maxEpoch) {
        currentEpoch = 0;
        chartClear();
        chartAddEpoch(data, currentEpoch);
        goEpoch(currentEpoch, data);
      }

      interval = setInterval(function () {
        if (currentEpoch < maxEpoch) {
          currentEpoch++;
          chartAddEpoch(data, currentEpoch);
          goEpoch(currentEpoch, data);
        } else {
          clearInterval(interval);
          $(".play").removeClass("grayed");
        }
      }, intervalTime);
    }
  });

  goEpoch(currentEpoch, data);
}

function goEpoch(epoch, data) {
  $(".wrapper .cell").remove();

  if (epoch == 0) {
    $(".back").addClass("grayed");
  } else {
    $(".back").removeClass("grayed");
  }
  if (epoch < data.WeeklyData.length - 1) {
    $(".next").removeClass("grayed");
  } else {
    $(".next").addClass("grayed");
  }

  $(".headerCell .season").text(data.WeeklyData[epoch].Season);
  $(".headerCell .week").text(data.WeeklyData[epoch].Week);

  $(".aggregated-fanclub-size").text(ts(data.WeeklyData[epoch].FanclubSize));
  $(".aggregated-arena-capacity").text(
    ts(data.WeeklyData[epoch].ArenaCapacity)
  );

  let ms = maxStats(data, epoch);
  if (data.WeeklyData[epoch].Matches.length > 0)
    $(".aggregated-hatstats").text(
      ts(chartData(data, epoch)) + " / " + ts(ms.htstats)
    );
  else $(".aggregated-hatstats").text("- / " + ts(ms.htstats));
  $(".aggregated-power-rating").text(
    ts(data.WeeklyData[epoch].PowerRating) + " / " + ts(ms.powerRating)
  );

  setStaff(data.WeeklyData[epoch].StaffList);
  setEpoch(data.PlayerList, data.WeeklyData[epoch].PlayerData);
}

function setStaffSkill(cell, type, level) {
  let staffTypes = [
    "none",
    "a_trainer",
    "medic",
    "spokeperson",
    "psychologist",
    "form",
    "fin_dir",
    "tactical_a",
  ];

  let background = "img/" + staffTypes[type] + "_skillholder.png";
  let foreground = "img/" + staffTypes[type] + "_skillbar.png";

  $(".skill", cell).css("background-image", "url(" + background + ")");
  $(".skill-level", cell).attr("src", foreground);
  $(".skill-level", cell).css("margin-left", "-" + (5 - level) * 14 + "px");
}

function setStaff(staffList) {
  let trainerTypes = ["defensivo", "ofensivo", "neutro"];
  $(".trainer .faceCard img").attr(
    "src",
    folder + staffList.Trainer.TrainerId + ".png"
  );
  $(".trainer .trainer-name").text(staffList.Trainer.Name);
  $(".trainer .trainer-age").text(staffList.Trainer.Age);
  $(".trainer .trainer-age-days").text(staffList.Trainer.AgeDays);
  $(".trainer .trainer-type").text(trainerTypes[staffList.Trainer.TrainerType]);
  $(".trainer .trainer-leadership").text(
    levelDenomination(staffList.Trainer.Leadership) +
      " (" +
      staffList.Trainer.Leadership +
      ")"
  );

  setStaffSkill($(".trainer"), 1, staffList.Trainer.TrainerSkillLevel);

  let n = 0;
  staffList.StaffMembers.forEach((sm) => {
    let s = $(".staffList .staff").eq(n);

    $(".staff-name", s).text(sm.Name);
    $(".faceCard img", s).attr("src", folder + sm.StaffId + ".png");
    setStaffSkill(s, sm.StaffType, sm.StaffLevel);
    n++;
  });
}

function setEpoch(playerList, playerEpoch) {
  let n = 0;
  let cell;
  let aggregated = {
    players: 0,
    TSI: 0,
    value: 0,
    salary: 0,
    htms: 0,
    htms28: 0,
  };

  playerEpoch.forEach((weeklyData) => {
    cell = $("#modelCell").clone();
    $(".wrapper").append(cell);
    cell.show();
    playerList.forEach((data) => {
      if (data.PlayerID == weeklyData.PlayerID) {
        sumAggregated(aggregated, weeklyData);
        setPlayer(cell, data, weeklyData);
        n++;
      }
    });
  });

  setAggregated(aggregated);
}

function setAggregated(aggregated) {
  $(".aggregated-players").text(ts(aggregated.players));
  $(".aggregated-tsi").text(ts(aggregated.TSI));
  $(".aggregated-value").text(ts(aggregated.value));
  $(".aggregated-salary").text(ts(aggregated.salary));
  $(".aggregated-htms").text(ts(aggregated.htms));
  $(".aggregated-htms28").text(ts(aggregated.htms28));
}

function sumAggregated(aggregated, weeklyData) {
  let htmsValues = htms(weeklyData);

  aggregated.players++;
  aggregated.TSI += weeklyData.TSI;
  aggregated.value += weeklyData.EstimatedValue;
  aggregated.salary += weeklyData.Salary;
  aggregated.htms += htmsValues.htms;
  aggregated.htms28 += htmsValues.htms28;
}

function setPlayer(cell, data, weeklyData) {
  let htmsValues = htms(weeklyData);

  cell.attr("id", data.PlayerID);
  $(".faceCard img", cell).attr("src", folder + data.PlayerID + ".png");
  $("a", cell).attr(
    "href",
    "https://www.hattrick.org/goto.ashx?path=/Club/Players/Player.aspx?playerId=" +
      data.PlayerID
  );
  $(".player-number", cell).text(weeklyData.PlayerNumber);
  $(".player-name", cell).text(data.FirstName + " " + data.LastName);
  if (weeklyData.InjuryLevel < 0) {
    $(".icon-injury", cell).hide();
  } else if (weeklyData.InjuryLevel == 0) {
    $(".icon-injury", cell).attr("src", "img/bruised.png").show();
  } else {
    $(".icon-injury", cell).attr("src", "img/injured.png").show();
    $(".player-injury-level", cell).text(weeklyData.InjuryLevel).show();
  }
  if (weeklyData.Cards > 0) {
    $(".icon-cards", cell)
      .attr("src", "img/cardsx" + weeklyData.Cards + ".png")
      .show();
  }
  if (data.MotherClubBonus) {
    $(".icon-mother-club", cell).show();
  } else {
    $(".icon-mother-club", cell).hide();
  }
  $(".player-experience", cell).text(
    levelDenomination(weeklyData.Experience) +
      " (" +
      weeklyData.Experience +
      ")"
  );
  $(".player-leadership", cell).text(
    levelDenomination(weeklyData.Leadership) +
      " (" +
      weeklyData.Leadership +
      ")"
  );
  $(".player-loyalty", cell).text(
    levelDenomination(weeklyData.Loyalty) + " (" + weeklyData.Loyalty + ")"
  );
  $(".player-age", cell).text(weeklyData.Age);
  $(".player-age-days", cell).text(weeklyData.AgeDays);
  $(".player-tsi", cell).text(ts(weeklyData.TSI));
  $(".player-salary", cell).text(ts(weeklyData.Salary));
  $(".player-form .ht-bar", cell).attr("level", weeklyData.PlayerForm);
  $(".player-form .bar-denomination", cell).text(
    levelDenomination(weeklyData.PlayerForm)
  );
  setBarColor($(".player-form .bar-level", cell), weeklyData.PlayerForm, 8);

  $(".player-stamina .ht-bar", cell).attr("level", weeklyData.StaminaSkill);
  $(".player-stamina .bar-denomination", cell).text(
    levelDenomination(weeklyData.StaminaSkill)
  );
  setBarColor(
    $(".player-stamina .bar-level", cell),
    weeklyData.StaminaSkill,
    9
  );

  $(".player-estimated-value", cell).text(ts(weeklyData.EstimatedValue));

  if (data.SpecialtyID > 0) {
    $(".icon-speciality", cell).attr(
      "src",
      "img/" + speciality(data.SpecialtyID).toLowerCase() + ".png"
    );
    $(".icon-speciality", cell).show();
    $(".player-speciality", cell).text(speciality(data.SpecialtyID));
  } else {
    $(".icon-speciality", cell).hide();
    $(".player-speciality", cell).text("-");
  }
  $(".player-htms", cell).text(ts(htmsValues.htms));
  $(".player-htms28", cell).text(ts(htmsValues.htms28));

  let skills = [
    weeklyData.KeeperSkill,
    weeklyData.DefenderSkill,
    weeklyData.PlaymakerSkill,
    weeklyData.WingerSkill,
    weeklyData.PassingSkill,
    weeklyData.ScorerSkill,
    weeklyData.SetPiecesSkill,
  ];

  for (let i = 0; i < skills.length; i++) {
    let bar = $(".transferPlayerSkills .ht-bar", cell).eq(i);
    bar.attr("level", skills[i]);
    $(".bar-denomination", bar).text(levelDenomination(skills[i]));
    $(".bar-level", bar).width("" + (skills[i] * 100) / 20 + "%");
  }
}

function chartCreate() {
  const graph = $("#htstats");
  const data = {
    labels: [],
    datasets: [
      {
        label: "hatstats",
        data: [],
        spanGaps: true,
        tension: 0.4,
      },
    ],
  };
  const config = {
    type: "line",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  };

  chart = new Chart(graph, config);
  console.log("Create chart" + chart);
}

function chartClear() {
  chart.config.data.datasets = [
    {
      label: "hatstats",
      data: [],
      spanGaps: true,
      tension: 0.4,
    },
  ];
  chart.config.data.labels = [];
}

function chartLabel(data, epoch) {
  if (data.WeeklyData[epoch].Week == 1)
    return "T" + data.WeeklyData[epoch].Season;
  else return "J" + data.WeeklyData[epoch].Week;
}

function chartData(data, epoch) {
  let htstats = null;

  data.WeeklyData[epoch].Matches.forEach((match) => {
    htstats = Math.max(
      match.RatingMidfield * 3 +
        match.RatingRightDef +
        match.RatingMidDef +
        match.RatingLeftDef +
        match.RatingRightAtt +
        match.RatingMidAtt +
        match.RatingLeftAtt,
      htstats
    );
  });

  return htstats;
}

function maxStats(data, epoch) {
  let htstats = null;
  let powerRating = null;
  let n = 0;

  for (n = 0; n <= epoch; n++) {
    data.WeeklyData[n].Matches.forEach((match) => {
      htstats = Math.max(
        match.RatingMidfield * 3 +
          match.RatingRightDef +
          match.RatingMidDef +
          match.RatingLeftDef +
          match.RatingRightAtt +
          match.RatingMidAtt +
          match.RatingLeftAtt,
        htstats
      );
    });
    powerRating = Math.max(powerRating, data.WeeklyData[n].PowerRating);
  }

  return { htstats: htstats, powerRating: powerRating };
}

function chartAddEpoch(data, epoch) {
  chart.config.data.datasets[0].data.push(chartData(data, epoch));
  chart.config.data.labels.push(chartLabel(data, epoch));
  chart.update();

  if (chart.config.data.datasets[0].data.length > chartElements) {
    chart.config.data.labels.shift();
    chart.config.data.datasets[0].data.shift();
    chart.update();
  }
}

function chartRemoveEpoch(data, epoch) {
  chart.config.data.datasets[0].data.pop();
  chart.config.data.labels.pop();
  chart.update();

  let e = epoch - chartElements;

  if (e >= 0) {
    chart.config.data.datasets[0].data.unshift(chartData(data, e));
    chart.config.data.labels.unshift(chartLabel(data, e));

    chart.update();
  }
}
