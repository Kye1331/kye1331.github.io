//FLUCTUANT FIELD
let ff = {
	unl: (force) => force ? fluc.unl() : ff_tmp.unl && ff_tmp.eff,

	data: {
		all: ["am", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"],

		f1: {
			//Superefficient
			//Quantum Eff -> Replicanti Chance Exp
			targ: () => tmp.qe && tmp.qe.exp && 2 / Math.min(2 - tmp.qe.exp * 2, 1) - 1,
			based: "Quantum Efficiency",
			req: 1,
			eff: (x) => x / 100 + 1,
			effDisp: (x) => "^" + shorten(x) + " Replicate Chance Exponent"
		},
		f2: {
			//Accelerator
			//Replicanti Energy -> Replicanti Stealth
			targ: () => QCs_save && QCs_save.qc5 && Math.log10(QCs_save.qc5.add(1).log10() + 1),
			based: "Replicanti Energy",
			req: 2,
			eff: (x) => 1,
			effDisp: (x) => shorten(x) + "x Replicanti Stealth"
		},
		f3: {
			//Excite
			//Quantum Energy -> Higher Altitudes
			targ: () => qu_save && Decimal.add(qu_save.quarkEnergy, 1).log10(),
			based: "Quantum Energy",
			req: 4,
			eff: (x) => 1,
			effDisp: (x) => formatPercentage(x - 1) + "% Higher Altitudes",
		},
		f4: {
			//Stretch
			//Vibration Energy -> Longer Altitudes
			targ: () => str_save && Math.log10(str_save.energy + 1),
			based: "Vibration Energy",
			req: 5,
			eff: (x) => 1,
			effDisp: (x) => formatPercentage(x - 1) + "% Longer Vibrations",
		},
		f5: {
			//Flux
			//Galaxies -> Positronic Charge Exponent
			targ: () => pos_save && Decimal.add(pos_save.eng, 1).log10(),
			based: "Galaxies",
			req: 7,
			eff: (x) => 1,
			effDisp: (x) => "^" + shorten(x) + " Positronic Charge"
		},
		f6: {
			//Overseer
			//Red Charge -> Obsure Galaxies
			targ: () => ff.getColorCharge("r"),
			based: "Red Charge",
			req: 9,
			eff: (x) => 1,
			effDisp: (x) => formatPercentage(x - 1) + "% later Obscure Galaxies",
		},
		f7: {
			//Advancement
			//Green Charge -> Extra Replicanti Compressors
			targ: () => ff.getColorCharge("g"),
			based: "Green Charge",
			req: 9,
			eff: (x) => 1,
			effDisp: (x) => "+" + shorten(x) + " Replicated Compressors",
		},
		f8: {
			//Dominant
			//Blue Charge -> Higher PB11 Cap
			targ: () => ff.getColorCharge("b"),
			based: "Blue Charge",
			req: 9,
			eff: (x) => 1,
			effDisp: (x) => "^" + shorten(x) + " to PB11 limit",
		},
		f9: {
			targ: () => 1,
			based: "???",
			req: 1/0,
			eff: (x) => 1,
			effDisp: (x) => "???", //formatPercentage(x - 1),
		},
		f10: {
			targ: () => 1,
			based: "???",
			req: 1/0,
			eff: (x) => 1,
			effDisp: (x) => "???", //formatPercentage(x - 1),
		},
		f11: {
			targ: () => 1,
			based: "???",
			req: 1/0,
			eff: (x) => 1,
			effDisp: (x) => "???", //formatPercentage(x - 1),
		},
		f12: {
			targ: () => 1,
			based: "???",
			req: 1/0,
			eff: (x) => 1,
			effDisp: (x) => "???", //formatPercentage(x - 1),
		},

		am: {
			targ: () => Math.sqrt(Math.log10(Decimal.add(player.money, 1).log10() + 1)),
			req: 0,
			based: "antimatter"
		}
	},

	setup() {
		ff_save = {
			links: [],
			prods: [],
			arcs: {},
		}
		fluc_save.ff = ff_save
		return ff_save
	},
	compile() {
		ff_tmp = { unl: this.unl(true) }
		if (!tmp.ngp3) return

		var data = ff_save || this.setup()
		if (!data.links) data.links = []
		if (!data.prods) data.prod = []
		delete data.prod

		this.updateTmp()
	},
	reset() {
		ff_save = {
			links: [],
			prod: 0,
			arcs: {},
		}
		ff.updateTmp()
	},

	update(diff) {
	},
	updateTmp() {
		ff_tmp = {
			unl: ff_tmp.unl
		}

		ff_tmp.unlocked = []
		ff_tmp.nextAt = 1/0
		for (var i = 0; i < ff.data.all.length; i++) {
			var id = ff.data.all[i]
			if (ff.isUnlocked(id)) ff_tmp.unlocked.push(id)
			else ff_tmp.nextAt = Math.min(ff_tmp.nextAt, ff.data[id].req)
		}

		ff.updateTmpOnTick()
	},
	updateTmpOnTick() {
		if (!ff_tmp.unl) return

		//Energy
		ff_tmp.eng = ff.getEnergy("am")
		for (var i = 0; i < ff.data.all.length; i++) {
			var id = ff.data.all[i]
			if (this.isProducing(id)) ff_tmp.eng += ff.getEnergy(id)
		}

		//Boosts
		ff_tmp.eff = {}
		for (var i = 1; i <= 8; i++) {
			var id = "f" + i
			ff_tmp.eff[id] = ff.data[id].eff(Math.max(ff_tmp.eng - i, 0))
		}
	},

	updateTab() {
		for (var i = 1; i <= 12; i++) {
			var id = "f" + i
			var eff = ff_tmp.eff[id]
			el("ff_eff_" + id).textContent =
				(this.isActive(id) ? "" : "(Inactive) ") +
				ff.data[id].effDisp(eff) +
				(this.isProducing(id) ? " [+0 Energy]" : "")
		}
		el("ff_eng_am").textContent = "[" + shorten(ff_tmp.eng) + " Energy]"

		ff.updateDisplays() // Temp
	},
	updateDisplays() {
		for (var i = 0; i < ff.data.all.length; i++) {
			var id = ff.data.all[i]
			el("ff_btn_" + id).style.visibility = ff.isUnlocked(id) ? "visible" : "hidden"
		}
		el("ff_eng").textContent = "You have assorted " + getFullExpansion(0) + " / " + getFullExpansion(fluc_save.energy) + " Fluctuant Energy in this field."
		el("ff_unl").textContent = ff_tmp.nextAt == 1/0 ? "" : "Next Perk unlocks at " + getFullExpansion(ff_tmp.nextAt) + " Fluctuant Energy."

		/*ff.draw("f1", "f2", 1)
		ff.draw("f2", "f3", 1)
		ff.draw("f4", "f5", 1)
		ff.draw("f5", "f6", 1)
		ff.draw("f2", "am", 2)
		ff.draw("f5", "am", 2)
		ff.draw("f7", "am", 2)
		ff.draw("am", "f8", 3)*/
	},
	draw(a, b, c) {
		if (!ff.isUnlocked(a)) return
		if (!ff.isUnlocked(b)) return

		var start = el("ff_btn_" + a).getBoundingClientRect();
		var end = el("ff_btn_" + b).getBoundingClientRect();
		var x1 = start.left + (start.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft);
		var y1 = start.top + (start.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop);
		var x2 = end.left + (end.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft);
		var y2 = end.top + (end.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop);

		ff_ctx.lineWidth = 8
		ff_ctx.beginPath()
		ff_ctx.strokeStyle = [null, "#ff3f00", "#ff003f", "#ffdf00"][c]

		ff_ctx.moveTo(x1, y1)
		ff_ctx.lineTo(x2, y2)
		ff_ctx.stroke()
	},

	getColorCharge(color) {
		let r = E(0)
		if (colorCharge !== undefined) {
			if (colorCharge.normal && colorCharge.normal.color) r = colorCharge.normal.charge
			if (colorCharge.sub && colorCharge.sub.color) r = colorCharge.sub.charge
		}
		return r.add(1).log10()
	},

	getEnergy(id) {
		return ff.data[id].targ()
	},
	getStrength(id) {
		return 1
	},
	isUnlocked(id) {
		return fluc_save.energy >= (ff.data[id].req || 0)
	},
	isActive(id) {
		return id == "am" || ff.isUnlocked(id) && false
	},
	isProducing(id) {
		return ff_save.prods && ff_save.prods.includes(id)
	},


	clear() {
		
	},
}
let ff_tmp = {}
let ff_save
let FLUCTUANT_FIELD = ff

var ff_c = el("ff_canvas");
var ff_ctx = ff_c.getContext("2d");