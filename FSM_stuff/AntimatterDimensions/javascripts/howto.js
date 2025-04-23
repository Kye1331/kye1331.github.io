var player = {};

//Do not remove.
var beta = true
var betaId = beta ? "A-" : ""

//Was "ds" before Respecced happened.
var prefix = "Gds"
var savePrefix = betaId + prefix + "AM_"
var metaSaveId = betaId + "GAD_aarexModifications"

function changestate(n) {
    var classes = el('div'+n).classList
    if(classes.contains('hidden')){
		classes.remove('hidden');
	    classes.add('shown');
	}
    else{
		classes.remove('shown');
		classes.add('hidden');
	}
}

if (localStorage.getItem("howToSpoilers") !== null) var spoilers = parseInt(localStorage.getItem("howToSpoilers"))
else var spoilers = 0

if (spoilers === 0) el("showspoilersbtn").innerHTML = "View: <br> Avoid spoilers"
else el("showspoilersbtn").innerHTML= "View: <br> Show spoilers"

function save() {
	localStorage.setItem("howToSpoilers", spoilers)
}

function get_save(id) {
    try {
        var dimensionSave = localStorage.getItem(btoa(savePrefix+id))
        if (dimensionSave !== null) dimensionSave = JSON.parse(atob(dimensionSave, function(k, v) { return (v === Infinity) ? "Infinity" : v; }))
        return dimensionSave
    } catch(e) { console.log("An error happened"); }
}

function load_game() {
	metaSave = localStorage.getItem(metaSaveId)
	if (metaSave == null) metaSave = {}
	else metaSave = JSON.parse(atob(metaSave))
	if (metaSave.current == undefined) {
		metaSave.current = 1
		metaSave.saveOrder = [1]
	}
	player = get_save(metaSave.current)
}

function showspoilers() {
	if (spoilers === 0) {
		spoilers = 1;
		el("showspoilersbtn").innerHTML= "View: <br> Show spoilers"
	} else {
		spoilers = 0;
		el("showspoilersbtn").innerHTML = "View: <br> Avoid spoilers"
	}
	save()
	updateSpoilers();
}

function updateSpoilers() {
	var displayed = spoilers
	var ngp3 = player && player.masterystudies
	el("ng3pguide").style.display = ngp3 || spoilers ? "" : "none"
	for (i = 29; i > 0; i--) {
		if (i != 7) {
			if (!displayed) {
				if (i < 5) displayed = 1
				else if (player) {
					if (i == 5 && player.resets > 4) displayed = 1
					if (i == 9 && hasAch("r21")) displayed = 1
					if (i == 10 && hasAch("r41")) displayed = 1
					if (i == 11 && player.infDimensionsUnlocked[0]) displayed = 1
					if (i == 12 && player.postChallUnlocked > 0) displayed = 1
					if (i == 13 && player.replicanti.unlocked) displayed = 1
					if (i == 17 && hasAch("r96")) displayed = 1
					if (i == 18 && (player.eternityChallUnlocked > 0 || player.eternityChalls.eterc1)) displayed = 1
					if (i == 19 && player.dilation.studies.includes(1)) displayed = 1
					if (i == 20 && player.dilation.studies.includes(6)) displayed = 1
					if (i == 22 && player.quantum) if (player.quantum.times>0) displayed = 1
					if (player.masterystudies) {
						if (i == 21 && player.dilation.upgrades.includes("ngpp4")) displayed = 1
						if (i == 23 && player.quantum && player.quantum.times > 0) displayed = 1
						if (i == 25 && player.masterystudies.includes("d7")) displayed = 1
						if (i == 26 && player.masterystudies.includes("d8")) displayed = 1
						if (i == 27 && player.quantum && player.quantum.qc && player.quantum.qc.comps >= 7) displayed = 1
						if (i == 28 && player.quantum && player.quantum.pc && player.quantum.pc.best >= 8) displayed = 1
					}
					if (player.fluc) {
						if (i == 29 && player.fluc.energy > 0) displayed = 1
					}
				}
			}
			if (displayed) {
				if (i == 22) {
					var msg = "When you reach "
					if (ngp3) msg += "e385 meta-antimatter and completed EC14 for the first time"
					else msg += "infinity meta-antimatter"
					msg += ", you will able to go quantum. Quantum will reset everything eternity resets, and also time studies, eternity challenges, dilation, "+(ngp3?"meta dimensions, and mastery studies":"and meta dimensions (except your best meta-antimatter)")+". You will gain anti-Quarks and quantum energy in return, besides with a multiplier to quantum energy."
					if (ngp3) msg += "<br><br>You will also unlock Quantum Milestones where you must go fast or progress to get your QoL content rewards on eternity, and even quantum autobuyer."
					el("div22").innerHTML = msg
				}
			} else el("div"+i).className = "hidden";
			el("div"+i+"btn").style.display = displayed ? "block" : "none";
			el("div"+i+"hr").style.display = displayed ? "block" : "none";
		}
	}
}

el("importbtn").onclick = function () {
    var save_data = prompt("Input your save.");
	save_data = JSON.parse(atob(save_data), function(k, v) { return (v === Infinity) ? "Infinity" : v; });
	if (!save_data) {
		alert('could not load the save..');
		return;
	}
	player = save_data;
	updateSpoilers()
};

load_game();
save()
updateSpoilers()
