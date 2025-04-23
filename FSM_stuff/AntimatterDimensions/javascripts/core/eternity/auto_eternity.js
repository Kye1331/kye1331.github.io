function updateAutoEterMode() {
	var modeText = ""
	var modeCond = ""
	el("priority13").disabled = false
	if (player.autoEterMode == "replicanti" || player.autoEterMode == "peak") player.autoEterMode = "time"
	if (player.autoEterMode == "time") {
		modeText = "time"
		modeCond = "Seconds between eternities:"
	} else if (player.autoEterMode == "relative") {
		modeText = "X times last eternity"
		modeCond = modeText + ":"
	} else if (player.autoEterMode == "relativebest") {
		modeText = "X times best of last 10"
		modeCond = modeText + " eternities:"
	} else if (player.autoEterMode == "eternitied") {
		modeText = "X times eternitied"
		modeCond = modeText + ":"
	} else if (player.autoEterMode == "exponent") {
		modeText = "eternitied^X"
		modeCond = "Wait until your gain reaches ^x of total eternities: "
	} else if (player.autoEterMode === undefined || player.autoEterMode == "amount") {
		modeText = "amount"
		modeCond = "Amount of EP to wait until reset:"
	} else {
		modeText = "[DELETED]"
		modeCond = "Click the auto-eternity mode!"
	}
	el("toggleautoetermode").textContent = "Auto eternity mode: " + modeText
	el("eterlimittext").textContent = modeCond
}

function toggleAutoEterMode() {
	if (player.autoEterMode == "amount") player.autoEterMode = "time"
	else if (player.autoEterMode == "time") player.autoEterMode = "relative"
	else if (player.autoEterMode == "relative") player.autoEterMode = "relativebest"
	else if (player.autoEterMode == "relativebest" && qMs.tmp.amt >= 4) player.autoEterMode = "eternitied"
	else if (player.autoEterMode == "eternitied") player.autoEterMode = "exponent"
	else if (player.autoEterMode) player.autoEterMode = "amount"
	updateAutoEterMode()
}

function toggleAutoEter(id) {
	player.autoEterOptions[id] = !player.autoEterOptions[id]
	el(id + 'auto').textContent = (id == "dilUpgs" ? "Auto-buy dilation upgrades" : (id == "rebuyupg" ? "Rebuyable upgrade a" : id == "metaboost" ? "Meta-boost a" : "A") + "uto") + ": " + (player.autoEterOptions[id] ? "ON" : "OFF")
	if (id.slice(0,2) == "td") {
		var removeMaxAll = false
		for (var d = 1; d < 9; d++) {
			if (player.autoEterOptions["td" + d]) {
				if (d > 7) removeMaxAll = true
			} else break
		}
		el("maxTimeDimensions").style.display = removeMaxAll ? "none" : ""
	}
}

function doAutoEterTick() {
	if (!player.meta) return
	if (hasAch("ngpp17")) {
		if (player.masterystudies == undefined || tmp.be || !qu_save.bigRip.active) for (var d = 1; d < 9; d++) if (player.autoEterOptions["td" + d]) buyMaxTimeDimension(d)
		if (player.autoEterOptions.epmult) buyMaxEPMult()
		if (player.autoEterOptions.blackhole) {
			buyMaxBlackholeDimensions()
			feedBlackholeMax()
		}
	}
	if (player.autoEterOptions.tt && !(hasDilationUpg(10) && getTTProduction() > 1e3)) maxTheorems()
}

//Smart presets
var onERS = false
var onNGP3 = false
var poData

function save_preset(id, placement) {
	let data = el("preset_" + id +"_data").value
	presets[id].preset = presets.editing == placement ? data : getStudyTreeStr()
	localStorage.setItem(btoa(presetPrefix + id), btoa(JSON.stringify(presets[id])))
	delete presets.editing

	changePresetTitle(id, placement)
	$.notify("Preset saved", "info")
}

function toggle_preset_reset(load) {
	if (!load) {
		aarMod.presetReset = !aarMod.presetReset
		el("toggle_preset_reset").style.display = tmp.ngp3 ? "" : "none"
	}
	el("toggle_preset_reset").textContent = "Eternity on load: " + (aarMod.presetReset ? "ON" : "OFF")
}

function load_preset(id, placement) {
	let data = el("preset_" + id + "_data").value

	if (aarMod.presetReset) {
		if (!pH.can("eternity")) return

		player.respec = true
		if (tmp.ngp3) player.respecMastery = true
		eternity(false, true, true, presets[id].dilation)
	} else if (presets[id].dilation) dilateTime(true)

	let saved = false
	if (data != presets[id].preset && id == presets.editing) {
		delete presets.editing
		presets[id].preset = data
		localStorage.setItem(btoa(presetPrefix + id), btoa(JSON.stringify(presets[id])))
		changePresetTitle(id, placement)
		saved = true
	}

	importStudyTree(data)
	closeToolTip()
	$.notify("Preset" + (saved ? " saved and " : "") + " loaded", "info")
}

function delete_preset(presetId) {
	if (!confirm("Do you really want to erase this preset? You will lose access to this preset!")) return
	var alreadyDeleted = false
	var newPresetsOrder = []
	for (var id = 0; id < poData.length; id++) {
		if (alreadyDeleted) {
			newPresetsOrder.push(poData[id])
			changePresetTitle(poData[id], id)
		} else if (poData[id] == presetId) {
			if (id == presets.editing) delete presets.editing
			delete presets[presetId]
			localStorage.removeItem(btoa(presetPrefix + presetId))
			alreadyDeleted = true
			el("presets").deleteRow(id)
			loadedPresets--
		} else newPresetsOrder.push(poData[id])
	}
	metaSave["presetsOrder"+(player.boughtDims?"_ers":"")] = newPresetsOrder
	poData = newPresetsOrder
	localStorage.setItem(metaSaveId,btoa(JSON.stringify(metaSave)))
	$.notify("Preset deleted", "info")
}

function rename_preset(id) {
	presets[id].title = prompt("Input the new name for this preset. It is recommended you rename the preset based on what studies you have selected.")
	localStorage.setItem(btoa(presetPrefix + id), btoa(JSON.stringify(presets[id])))
	placement = 1
	while (poData[placement-1] != id) placement++
	changePresetTitle(id, placement)
	$.notify("Preset renamed", "info")
}

function move_preset(id,offset) {
	placement = 0
	while (poData[placement] != id) placement++

	if (offset < 0) {
		if (placement < -offset) return
	} else if (placement > poData.length - offset - 1) return
	if (id == presets.editing) presets.editing += offset

	var temp = poData[placement]
	poData[placement] = poData[placement+offset]
	poData[placement+offset] = temp
	el("presets").rows[placement].innerHTML = getPresetLayout(poData[placement])
	el("presets").rows[placement+offset].innerHTML = getPresetLayout(id)
	changePresetTitle(poData[placement], placement)
	changePresetTitle(poData[placement+offset], placement + offset)
	localStorage.setItem(metaSaveId, btoa(JSON.stringify(metaSave)))
}

var loadedPresets = 0
function openStudyPresets() {
	closeToolTip()
	let saveOnERS = !(!player.boughtDims)
	let saveOnNGP3 = player.masterystudies !== undefined
	if (saveOnERS != onERS) {
		delete presets.editing
		el("presets").innerHTML = ""
		presets = {}
		onERS = saveOnERS
		if (onERS) presetPrefix = prefix+"ERS_ST_"
		else presetPrefix = prefix+"AM_ST_"
		loadedPresets = 0
	} else if (saveOnNGP3 != onNGP3) {
		onNGP3 = saveOnNGP3
		for (var p = 0; p < loadedPresets; p++) {
			el("presets").rows[p].innerHTML = getPresetLayout(poData[p], p + 1)
			changePresetTitle(poData[p], p + 1)
		}
	}
	el("presetsmenu").style.display = "block";
	clearInterval(loadSavesIntervalId)
	occupied = false
	loadSavesIntervalId=setInterval(function(){
		if (occupied) return
		else occupied = true
		if (loadedPresets == poData.length) {
			clearInterval(loadSavesIntervalId)
			return
		} else if (!onLoading) {
			latestRow = el("presets").insertRow(loadedPresets)
			onLoading = true
		}
		try {
			var id = poData[loadedPresets]
			latestRow.innerHTML = getPresetLayout(id, loadedPresets + 1)
			changePresetTitle(id, loadedPresets + 1)
			loadedPresets++
			onLoading = false
		} catch (e) { console.error(e) }
		occupied = false
	}, 0)
}

function focus_preset(id, placement) {
	if (presets.editing) {
		changePresetTitle(presets.editing, placement, false)
		delete presets.editing
	}
	presets[id].dilation = el("preset_" + id + "_dilation").checked
	presets.editing = placement
	changePresetTitle(id, placement, true)
}

function getPresetLayout(id, placement) {
	return "<b id='preset_" + id + "_title'>Preset #" + placement + "</b><br>" +
		"<span id='preset_" + id + "_dilation_div'>Dilation run: <input id='preset_" + id + "_dilation' type='checkbox' onchange='focus_preset(" + id + ", " + placement + ")'></span><br>" +
		"<input id='preset_" + id +"_data' style='width: 75%' onchange='focus_preset(" + id + ", " + placement + ")'><br>" +

		"<button class='storebtn' onclick='save_preset(" + id + ", " + placement + ")'>Save</button>" +
		"<button class='storebtn' onclick='load_preset(" + id + ", " + placement + ")'>Load</button>" +
		"<button class='storebtn' onclick='rename_preset(" + id + ", " + placement + ")'>Rename</button>" +
		"<button class='storebtn' onclick='delete_preset(" + id + ", " + placement + ")'>Delete</button>" +

		"<span class='metaOpts'>" +
			"<button class='storebtn' onclick='move_preset(" + id + ", -1)'>⭡</button>" +
			"<button class='storebtn' onclick='move_preset(" + id + ", -1)'>⭣</button>" +
		"</span>"
}

function changePresetTitle(id, placement, editing) {
	if (!placement) {
		placement = 0
		while (poData[placement] != id) placement++
	}

	el("preset_" + id + "_dilation_div").style.display = hasDilationStudy(1) || pH.has("quantum")

	if (editing) {
		el("preset_" + id + "_title").textContent = (presets[id].title ? presets[id].title : "Preset #" + placement) + "*"
		return
	}

	if (presets[id] === undefined) {
		var preset = localStorage.getItem(btoa(presetPrefix + id))
		if (preset === null) {
			presets[id] = {preset: "|0", title: "Deleted preset #" + placement, dilation: false}
			localStorage.setItem(btoa(presetPrefix + id), btoa(JSON.stringify(presets[id])))
		} else presets[id] = JSON.parse(atob(preset))
		el("preset_" + id + "_dilation").checked = presets[id].dilation
	}
	el("preset_" + id + "_title").textContent = presets[id].title ? presets[id].title : "Preset #" + placement
	el("preset_" + id + "_data").value = presets[id].preset
}