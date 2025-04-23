var pos = {
	data: {
		types: {
			ng: {
				galName: "Antimatter Galaxies",
				pow(x) {
					return x * pos_tmp.mults.gal
				},
				sacGals(x) {
					return Math.min(player.galaxies / 4, x)
				}
			},
			rg: {
				galName: "base Replicated Galaxies",
				pow(x) {
					return QCs.done(4) ? x * pos_tmp.mults.gal * (PCs.milestoneDone(41) && PCs_save.lvl > 8 ? 3 : 2) / 5 : 0
				},
				sacGals(x) {
					return Math.min(player.replicanti.galaxies / 4, x)
				}
			},
			eg: {
				galName: "extra Replicated Galaxies",
				pow(x) {
					return PCs.milestoneDone(41) && PCs_save.lvl > 12 ? x * pos_tmp.mults.gal / 5 : 0
				},
				sacGals(x) {
					return Math.min(tmp.extraRG * pos_tmp.mults.gal, x)
				}
			},
			tg: {
				galName: "Tachyonic Galaxies",
				pow(x) {
					return PCs.milestoneDone(41) && PCs_save.lvl > 16 ? x * pos_tmp.mults.gal / 5 : 0
				},
				sacGals(x) {
					return Math.min(player.dilation.freeGalaxies * pos_tmp.mults.gal, x)
				}
			}
		},
		undercharged: {
			1: () => [2],
			2: () => [3],
			3: () => []
		}
	},
	setup() {
		pos_save = {
			on: false,
			gals: {
				ng: {sac: 0, qe: 0, pc: 0},
				rg: {sac: 0, qe: 0, pc: 0},
				eg: {sac: 0, qe: 0, pc: 0},
				tg: {sac: 0, qe: 0, pc: 0}
			},
			eng: E(0),
			lvl: 0,
			swaps: {}
		}
		qu_save.pos = pos_save
		return pos_save
	},
	compile() {
		if (!tmp.ngp3 || qu_save === undefined) {
			this.updateTmp()
			return
		}

		let data = pos_save || this.setup()

		if (!data.on) data.eng = 0
		if (!data.gals) data.gals = {
			ng: {sac: 0, qe: 0, pc: 0},
			rg: {sac: 0, qe: 0, pc: 0},
			eg: {sac: 0, qe: 0, pc: 0},
			tg: {sac: 0, qe: 0, pc: 0}
		}
		if (!data.swaps) data.swaps = {}

		data.eng = E(data.eng)

		if (data.consumedQE) delete data.consumedQE
		if (data.sacGals) delete data.sacGals
		if (data.sacBoosts) delete data.sacBoosts
		if (data.exictons) delete data.exictons
		if (data.excite) delete data.excite

		this.updateTmp()
	},
	reset() {
		this.setup()
		this.updateTmp()

		enB.updateTmp()
		enB.update("pos")
	},

	unl: (force) => force ? tmp.ngp3 && player.masterystudies.includes("d7") : pos_tmp.unl,
	on() {
		return this.unl() && pos_save && pos_save.on
	},
	toggle() {
		if (pos_save.on && !confirm("You will lose access to Positronic Boosts except the mastered ones. Are you sure?")) return
		pos_save.on = !pos_save.on
		restartQuantum(true)
	},
	setupHTML() {
		var html = ""
		for (var i = 1; i <= enB.pos.max; i++) html += this.getCloudBtn(i)
		el("pos_cloud1_boosts").innerHTML = html
	},

	updateTmp() {
		var data = {
			cloud: pos_tmp.cloud,
			unl: pos_tmp.unl
		}
		pos_tmp = data
		if (!data.unl) return

		data.mults = {
			mdb: QCs.done(3) ? 0.3 : 0.25,
			mdb_eff: QCs.done(5) ? 1.5 : 1,
			gal: QCs.done(5) ? 0.2 : 0.25,
			pc_base: QCs.done(5) ? 1 / 100 : 1 / 125,
			pc_exp: qu_superbalanced() ? 4 : 2
		}
		if (ff.unl()) data.mults.pc_exp *= ff_tmp.eff.f5
		if (PCs.milestoneDone(51)) data.mults.pc_base *= 1.2

		if (!data.sac) data.sac = {}
		if (!data.pow) data.pow = {}

		if (!data.cloud) data.cloud = {}
		data.cloud.swaps = !this.swapsDisabled() ? {... pos_save.swaps} : {}
		data.cloud.next = {... pos_save.swaps}
		data.cloud.div = {}

		this.updateCloud()
	},
	updateTmpOnTick() {
		if (!this.unl()) return
		let data = pos_tmp

		//Meta Dimension Boosts or Quantum Energy -> Positrons
		eng = E(0)
		if (this.on()) {
			let mdbStart = 0
			let mdbMult = pos_tmp.mults.mdb

			data.sac.mdb = Math.floor(Math.max(player.meta.resets - mdbStart, 0) * mdbMult)
			data.sac.qe = qu_save.quarkEnergy.div(tmp.ngp3_mul ? 9 : 3)
			pos_save.amt = Math.sqrt(Math.min(
				data.sac.mdb * (PCs.milestoneDone(51) ? Math.max(data.sac.mdb / 30, 1) : 1) * pos_tmp.mults.mdb_eff,
				Math.pow(data.sac.qe.toNumber() * (tmp.bgMode ? 2 : 1.5), 2)
			)) * 300
		} else {
			data.sac.mdb = 0
			data.sac.qe = 0
			pos_save.amt = 0
		}
		if (futureBoost("excited_positrons") && dev.boosts.tmp[2]) pos_save.amt *= dev.boosts.tmp[2]

		//Galaxies -> Charge
		let types = ["ng", "rg", "eg", "tg"]
		let pcSum = 0
		let pow = data.pow
		for (var i = 0; i < types.length; i++) {
			var type = types[i]
			var save_data = pos_save.gals[type]

			pow[type] = this.data.types[type].pow(pos_save.amt)
			save_data.sac = Math.floor(this.data.types[type].sacGals(pow[type]))
			save_data.pc = Math.pow(save_data.sac * pos_tmp.mults.pc_base, 2)
			if (save_data.pc > 1e6) save_data.pc /= Math.log10(save_data.pc) / 6
			pcSum += save_data.pc
		}

		if (!pos.on() && enB.active("glu", 6)) eng = enB_tmp.eff.glu6
		else eng = Decimal.pow(pcSum, pos_tmp.mults.pc_exp)
		if (futureBoost("potential_strings") && dev.boosts.tmp[3]) eng = eng.times(dev.boosts.tmp[3])

		pos_save.eng = isNaN(eng.e) ? E(0) : eng

		this.updateUndercharged()
	},

	updateTab() {
		el("pos_formula").textContent = getFullExpansion(pos_tmp.sac.mdb) + " Meta Dimension Boosts + " + shorten(pos_tmp.sac.qe) + " Quantum Energy ->"
		el("pos_toggle").textContent = pos_save.on ? "ON" : "OFF"
		el("pos_amt").textContent = getFullExpansion(pos_save.amt)

		let types = ["ng", "rg", "eg", "tg"]
		let msg = []
		for (var i = 0; i < types.length; i++) {
			var type = types[i]
			var gals = pos_save.gals[type].sac
			if (gals > 0 || type == "ng") msg.push(getFullExpansion(gals) + " sacrificed " + pos.data.types[type].galName)
		}
		el("pos_charge_formula").innerHTML = wordizeList(msg, false, " +<br>", false) + " -> "

		enB.updateOnTick("pos")
		if (!pos_tmp.cloud.shown) {
			if (enB.has("pos", 4)) el("enB_pos4_exp").textContent = "(^" + (1 / enB_tmp.eff.pos4).toFixed(3) + ")"
			if (enB.has("pos", 7)) el("enB_pos2_mention_1").textContent = enB.name("pos", 2)
			if (enB.has("pos", 11)) el("enB_pos11_info").textContent = "(x^" + (enB_tmp.eff.pos11.exp == 0 ? 0 : "1/" + shorten(1 / enB_tmp.eff.pos11.exp)) + ")"
			if (enB.has("pos", 12)) el("enB_pos2_mention_2").textContent = enB.name("pos", 2)

			for (var i = 1; i <= enB.pos.max; i++) {
				if (!enB.has("pos", i)) return
				el("enB_pos" + i).className = enB.color(i, "pos")
			}
		}
		if (pos_tmp.cloud.shown) {
			for (var i = 1; i <= enB.pos.max; i++) {
				if (!enB.mastered("pos", i)) continue

				el("pos_boost" + i + "_btn").setAttribute('ach-tooltip', "Boost: " + enB.pos[i].dispFull(enB_tmp.eff["pos" + i]) + (enB.pos.charged(i) ? "\nCharge: " + shortenDimensions(enB.pos.chargeEff(i)) + "x stronger" : ""))
				if (enB.mastered("pos", i)) pos.updateCharge(i)
			}
		}
	},
	switchTab() {
		var shown = !pos_tmp.cloud.shown
		pos_tmp.cloud.shown = shown
		el("pos_boost_div").style.display = !shown ? "" : "none"
		el("pos_cloud_div").style.display = shown ? "" : "none"
		el("pos_tab").textContent = shown ? "Show boosts" : "Show cloud"
	},

	//Charging
	updateCharge(i) {
		var lvl = enB.pos.lvl(i)
		var match = enB.pos.lvl(i, true) == lvl
		var charged = match && enB.pos.charged(i)
		var undercharged = match && !str.unl() && this.isUndercharged(i)
		el("pos_boost" + i + "_charge").textContent = undercharged ?
			"Undercharged! (Switch to Tier " + pos_tmp.undercharged[i] + ")" :
			charged ? shortenMoney(enB.pos.chargeEff(i)) + "x Charged" :
			"Charge: " + shorten(enB.pos.chargeReq(i, true))
		el("pos_boost" + i + "_charge").className = undercharged ? "undercharged" : charged ? "charged" : ""
	},
	isUndercharged(x) {
		return pos_tmp.undercharged[x] !== undefined
	},
	updateUndercharged() {
		var data = {}
		pos_tmp.undercharged = data
		if (pos_tmp.cloud.sum < 4) return

		//Tiers
		var eng = pos_save.eng
		var tiers_list = {}
		for (var i = 1; i <= 3; i++) tiers_list[i] = this.data.undercharged[i]()

		//Calculations
		for (var i = 1; i <= 12; i++) if (enB.mastered("pos", i)) {
			var tiers = tiers_list[enB.pos.lvl(i)]
			for (var t = 0; t < tiers.length; t++) if (Decimal.gte(eng, enB.pos.chargeReq(i, 0, tiers[t]))) data[i] = tiers[t]
		}
	},

	//Positronic Cloud
	updateCloud(quick) {
		if (!pos_tmp.unl) return

		var data = pos_tmp.cloud
		if (!data) return
		data = {
			div: data.div,
			swaps: data.swaps,
			next: data.next,
			chosen: data.chosen,
			allMastered: data.allMastered,
			shown: data.shown !== undefined ? data.shown : true
		}
		pos_tmp.cloud = data

		//Mechanic
		var data = pos_tmp.cloud
		data.total = 0
		data.exclude = 0
		data.swaps_amt = 0
		data.next_amt = 0

		data.swaps = pos.getSwaps()
		for (var i = 1; i <= enB.pos.max; i++) {
			var originalLvl = enB.pos[i].tier
			var lvl = enB.pos.lvl(i)
			var nextLvl = enB.pos.lvl(i, true)

			var has = enB.mastered("pos", i)
			var excluded = pos.excluded(i)

			el("pos_boost" + i + "_btn").style.display = has ? "" : "none"
			if (has) {
				if (data.div[i] != nextLvl) el("pos_cloud" + nextLvl + "_boosts").appendChild(el("pos_boost" + i + "_btn"))
				data.div[i] = nextLvl

				el("pos_boost" + i + "_btn").className = (pos_tmp.cloud.chosen ? 
					(pos_tmp.cloud.chosen == i ? "chosenbtn" : this.canSwap(i) ? "storebtn" : "unavailablebtn") :
					excluded ? "unavailablebtn" :
					data.next[i] ? (nextLvl > originalLvl ? "chosenbtn3" : "chosenbtn") :
					lvl != nextLvl ? "chosenbtn2" : "storebtn"
				) + " pos_btn"
				el("pos_boost" + i + "_excite").innerHTML = (lvl != nextLvl ? "(Next: " + lvl + " -> " + nextLvl + ")" : "Tier " + originalLvl + (originalLvl != lvl ? " -> " + lvl : "") + (pos_tmp.cloud.chosen == i ? "<br>(Selected)" : originalLvl != lvl ? "<br>(from PB" + pos_save.swaps[i] + ")" : ""))
				data[lvl] = (data[lvl] || 0) + 1

				if (originalLvl != lvl) data.swaps_amt++
				if (originalLvl != nextLvl) data.next_amt++

				if (excluded) data.exclude++
				else data.total++
			}
		}
		data.sum = data.total + data.exclude

		for (var i = 1; i <= 3; i++) {
			el("pos_cloud" + i + "_cell").innerHTML = "<b>Tier " + i + ": " + (data[i] || 0) + " / " + i * 2 + "</b>"
			el("pos_cloud" + i + "_cell").className = "pos_tier " + (data[i] >= i * 2 ? "green" : "")
			el("pos_cloud" + i + "_cell").style.display = data[i] ? "" : "none"
		}
		el("pos_cloud_total").textContent = "Total: " + data.total + (data.exclude ? " used // " + data.exclude + " disabled" : "")

		//Unlocks
		var unl = enB.pos.amt() >= 7
		if (!unl) data.shown = false

		el("pos_tab").style.display = unl ? "" : "none"
		el("pos_tab").textContent = data.shown ? "Show boosts" : "Show cloud"
		el("pos_boost_div").style.display = !data.shown ? "" : "none"
		el("pos_cloud_div").style.display = data.shown ? "" : "none"
		el("pos_cloud_req").innerHTML = unl ? "" : "<br>To unlock Positronic Cloud, you need to get Level " + getFullExpansion(enB.pos.amt()) + " / " + getFullExpansion(7) + "."
		el("pos_cloud_disabled").style.display = this.swapsDisabled() ? "" : "none"
	},
	getCloudBtn: (x) => ('<button id="pos_boost' + x + '_btn" onclick="pos.swap(' + x + ')">' +
							'<span>' +
								'<b>PB' + x + '</b><br>' +
								'<p id="pos_boost' + x + '_charge"></p>' +
								'<p id="pos_boost' + x + '_excite">(+0 tiers)</p>' +
							'</span>' +
						'</button>'),
	canSwap(x) {
		var old = enB.pos.lvl(x, true)
		var nw = enB.pos.lvl(pos_tmp.cloud.chosen, true)
		return !pos_tmp.cloud.next[x] && Math.abs(old - nw) == 1
	},
	getSwaps() {
		return this.swapsDisabled() ? {} : pos_tmp.cloud.swaps
	},
	swap(x) {
		if (!pos_tmp.cloud.chosen) {
			if (pos_tmp.cloud.next[x]) {
				var y = pos_tmp.cloud.next[x]
				delete pos_tmp.cloud.next[x]
				delete pos_tmp.cloud.next[y]
				pos.autoApply()
			} else {
				pos_tmp.cloud.chosen = x
				pos.updateCloud()
			}
		} else if (pos_tmp.cloud.chosen == x) {
			delete pos_tmp.cloud.chosen
			pos.updateCloud()
		} else {
			if (!this.canSwap(x)) return
			pos_tmp.cloud.next[x] = pos_tmp.cloud.chosen
			pos_tmp.cloud.next[pos_tmp.cloud.chosen] = x
			delete pos_tmp.cloud.chosen
			pos.autoApply()
		}
	},
	clearSwaps() {
		pos_tmp.cloud.next = {}
		pos.autoApply()
	},
	cancelSwaps() {
		if (!confirm("Do you want to cancel changes on Positronic Cloud?")) return
		pos_tmp.cloud.next = {... pos_save.swaps}
		pos.updateCloud()
	},
	autoApply() {
		if (aarMod.autoApply) pos.applySwaps(true)
		else pos.updateCloud()
	},
	applySwaps(auto) {
		if (!auto && !confirm("Do you want to apply the changes immediately? This restarts your Quantum run!")) return
		if (dev.noReset) {
			pos_save.swaps = {... pos_tmp.cloud.next}
			pos.updateTmp()
		} else restartQuantum(true)
	},
	swapsDisabled() {
		return QCs_save && QCs_save.disable_swaps && QCs_save.disable_swaps.active
	},

	//Presets
	exportPreset() {
		let array = []
		for (var i = 1; i <= 12; i++) {
			if (array.includes(i)) continue
			if (pos_tmp.cloud.next[i]) {
				array.push(i)
				array.push(pos_tmp.cloud.next[i])
			}
		}

		let str = array.join(",")
		copyToClipboard(str)
	},
	getPreset(x) {
		let r = {}
		x = x.split(",")
		for (var i = 0; i < x.length; i += 2) {
			r[x[i]] = parseInt(x[i+1])
			r[x[i+1]] = parseInt(x[i])
		}
		return r
	},
	importPreset() {
		var x = prompt()
		x = pos.getPreset(x)

		pos_tmp.cloud.next = {}

		let next = {}
		let array = []
		for (var i = 1; i <= 12; i++) {
			delete pos_tmp.cloud.chosen
			if (array.includes(i)) continue
			if (x[i]) {
				console.log(i, x[i])
				array.push(i)
				array.push(x[i])

				pos_tmp.cloud.chosen = i
				if (pos.canSwap(x[i])) {
					next[i] = x[i]
					next[x[i]] = i
				}
				delete pos_tmp.cloud.chosen
			}
		}

		pos_tmp.cloud.next = next
		pos.autoApply()
	},

	//Others
	excluded(x) {
		return (futureBoost("exclude_any_qc") ? QCs.inAny() : QCs.in(2)) ? enB.pos.lvl(x) == QCs_save.qc2 : false
	},
}
var pos_save = undefined
var pos_tmp = {}

let POSITRONS = pos