let str = {
	unl: (force) => force ? (PCs_save && PCs_save.best >= 8) || fluc.unl() : str_tmp.unl,

	//Data
	data: {
		letters: ["α", "β", "γ"],
		names: ["Alpha", "Beta", "Gamma"],
		pos: {},
		effs: {
			a1: {
				req: 0,
				eff: (x) => Math.sqrt(x / 3 + 1),
				disp: (x) => "+" + formatPercentage(x-1) + "% base Quantum Power"
			},
			b1: {
				req: 0.4,
				eff: (x) => x,
				disp: (x) => "+" + shorten(x) + "x charge multiplier"
			},
			a2: {
				req: 1.1,
				eff: (x) => Math.sqrt(x / 3 + 1),
				disp: (x) => "^" + (1 / x).toFixed(3) + " to PC goals"
			},
			b2: {
				req: 2,
				eff: (x) => Math.log10(x / 4 + 1) + 1,
				disp: (x) => "-" + formatPercentage(x-1) + "% to PC completion scaling"
			},
			a3: {
				req: 2,
				eff: (x) => Math.min(Math.log10(x / 10 + 1) * 1.5 + 1, 10 / 3),
				disp: (x) => "^" + x.toFixed(3) + " to replicate chance"
			},
			b3: {
				req: 4,
				eff: (x) => x,
				disp: (x) => "+" + shorten(x) + " extra Replicanti Compressors"
			}
		},
		upgs: {
			1: {
				title: "Super Vibrater",
				eff: (x) => 4 + x,
				effDisp: (x) => "Able to vibrate last " + x + " positions.",

				req: (x) => Decimal.pow(10, 3.75 + x * x / 4),
				res: () => qu_save.bestEnergy,
				resDisp: "Quantum Energy"
			},
			2: {
				title: "Quantum Enabler",
				eff: (x) => x + 1,
				effDisp: (x) => "Protect first " + x + " vibrations.",

				req: (x) => Math.pow(2, x * x) * 8,
				res: () => str_save.energy,
				resDisp: "Vibration Energy"
			},
			3: {
				title: "Quantum Manifold",
				eff: (x) => x * 2,
				effDisp: (x) => "Protect first " + x + " positions.",
				hidden: () => !fluc.unl(),

				req: (x) => Math.floor(x * 1.8 + 1),
				res: () => fluc_save.energy,
				resDisp: "Fluctuant Energy"
			}
		}
	},

	//Save Data
	setup() {
		str_save = {
			energy: 0,
			spent: 0,
			vibrated: [],
			upgs: {}
		}
		qu_save.str = str_save
		return str_save
	},
	compile() {
		str_tmp = { unl: this.unl(true) }
		if (!tmp.ngp3 || qu_save === undefined) return

		var data = str_save || this.setup()
		if (data.effs) delete data.effs
		if (!data.upgs) data.upgs = {}
		if (!data.vibrated) data.vibrated = []

		this.updateTmp()
	},
	reset() {
		this.setup()
		this.updateTmp()
		this.updateDisp()
	},

	//Updates
	updateTmp() {
		var data = str_tmp
		if (!data.unl) return

		var vibrated = str_save.vibrated
		var all = this.data.all

		data.alt = {}
		data.disable = {}
		data.lastVibrate = 0
		data.vibrated = vibrated.length
		for (var i = 0; i < data.vibrated; i++) {
			this.onVibrate(vibrated[i])
		}
		str_save.spent = str.veCost(data.vibrated)

		//Powers
		data.powers = {}
		data.used = {}
		for (var i = 1; i <= 18; i++) {
			var pow = Math.ceil(i / 6)
			data.powers[pow] = (data.powers[pow] || 0) + this.altitude(i)
			if (vibrated.includes(i)) data.used[pow] = (data.used[pow] || 0) + 1
		}
	},
	updateDisp() {
		el("stringstabbtn").style.display = PCs.unl() ? "" : "none"

		var unl = this.unl()
		el("str_unl").style.display = !unl ? "" : "none"
		el("str_div").style.display = unl ? "" : "none"
		if (unl) el("str_cost").textContent = "(the next vibration costs " + shorten(this.veCost(str_tmp.vibrated + 1) - this.veCost(str_tmp.vibrated)) + ")"

		if (!unl) return
		if (!str_tmp.setupHTML) return

		for (var e = 1; e <= 18; e++) {
			var pos = this.data.pos[id]
			var alt = this.altitude(e)
			el("str_" + e + "_altitude").textContent = alt.toFixed(3)
			el("str_" + e).style.top = (1 - alt) * 72 + "px"
		}

		for (var u = 1; u <= 3; u++) {
			let upg = str.data.upgs[u]
			el("str_upg_" + u + "_btn").style.display = evalData(upg.hidden) ? "none" : ""
			el("str_upg_" + u + "_eff").textContent = upg.effDisp(this.upgEff(u))
			el("str_upg_" + u + "_cost").textContent = "(requires " + shortenDimensions(this.upgCost(u)) + " " + upg.resDisp + ")"
		}
	},

	//Updates on tick
	updateTmpOnTick() {
		var data = str_tmp
		if (!data.unl) return

		data.str = Math.log10(Math.log10(str_save.energy * 3 + 1) + 1) * 1.5 + 1

		//Boosts
		data.effs = {}
		for (var i = 1; i <= 3; i++) {
			data.effs["a" + i] = str.data.effs["a" + i].eff(Math.max(data.powers[i] * data.str - str.data.effs["a" + i].req, 0))
			data.effs["b" + i] = str.data.effs["b" + i].eff(Math.max(data.powers[i] * data.str - str.data.effs["b" + i].req, 0))
		}
	},
	updateDispOnTick() {
		if (!str_tmp.setupHTML || !str_tmp.unl) return

		let ve = str.veUnspent()
		el("str_ve").textContent = shorten(ve)
		el("str_ve_based").textContent = shiftDown ? "(based on Quantum Energy, Replicanti Energy, and PC level)" : ""

		for (var i = 1; i <= 18; i++) {
			var alt = str.altitude(i)
			el("str_" + i + "_eff").textContent = (alt < 0 ? "-" : "+") + shorten(Math.abs(alt) * str_tmp.str) + " to " + str.data.names[Math.ceil(i / 6) - 1]
			el("str_" + i).className = (str_save.vibrated.includes(i) ? "chosenbtn" : str.canVibrate(i) ? "storebtn" : "unavailablebtn") + " pos_btn"
		}

		for (var p = 1; p <= 3; p++) {
			var pow = str_tmp.powers[p]
			el("str_" + p + "_power").textContent = str.data.names[p-1] + ": " + (pow < 0 ? "-" : "") + shorten(Math.abs(pow) * str_tmp.str)
			el("str_a" + p + "_boost").textContent = str.data.effs["a" + p].disp(str_tmp.effs["a" + p])
			el("str_b" + p + "_boost").textContent = str.data.effs["b" + p].disp(str_tmp.effs["b" + p])
		}
		el("str_strength").textContent = shiftDown ? "Manifold Surgery: " + shorten(str_tmp.str) + "x strength to String boosts" : ""
		el("str_strength_based").textContent = shiftDown ? "(based on total Vibration Energy)" : ""

		for (var u = 1; u <= 3; u++) {
			el("str_upg_" + u + "_btn").className = str.canUpg(u) ? "storebtn str_upg" : "unavailablebtn"
			el("str_upg_" + u + "_title").innerHTML = shiftDown ? str.data.upgs[u].title + " (" + getFullExpansion(str.upgLvl(u)) + ")<br>" : ""
		}
	},
	updateFeatureOnTick() {
		str_save.energy = Math.max(str_save.energy, this.veGain())
	},

	//HTML + DOM elements
	setupBoost(x) {
		return '<div class="str_boost' + '" id="str_' + x + '_div">' +
			'<button id="str_' + x + '" onclick="str.vibrate(' + x + ')">' +
			'<b>' + str.data.letters[Math.ceil(x / 6) - 1] + ((x - 1) % 6 + 1) + '</b><br>' +
			'<span id="str_' + x + '_eff"></span></button>' +
			'<br><span id="str_' + x + '_altitude"></span></div>'
	},
	setupHTML() {
		if (str_tmp.setupHTML) return
		str_tmp.setupHTML = true

		var html = ""
		for (var e = 1; e <= 18; e++) html += this.setupBoost(e)
		el("str_boosts").innerHTML = html

		str.updateDisp()
	},

	//Vibration Energy
	veGain() {
		let r = qu_save.quarkEnergy.add(1).log10() / 3
		r *= Math.log10(QCs_save.qc5.add(1).log10() / 5 + 1) + 1
		r *= Math.pow(Math.max(r / 2, 2), Math.max(PCs_save.lvl / 8 - 1, 0))
		if (hasAch("ng3p34")) r *= 1.2
		return r
	},
	veUnspent() {
		return str_save.energy - str_save.spent
	},
	veCost(x) {
		return x ? Math.pow(1.5, x - 1) : 0
	},

	//Vibrations
	canVibrate(x) {
		let last = Math.floor(str_tmp.vibrated * 1.5 + 3)
		return str_save.energy >= str.veCost(str_tmp.vibrated + 1) &&
			str_tmp.lastVibrate + 3 >= x &&
			(str_tmp.used[Math.ceil(x / 6)] || 0) < 4 &&
			last >= x &&
			last - str.upgEff(1) < x
	},
	protect(x, vib) {
		return x <= Math.floor(vib * 1.5 + 3) || vib <= str.upgEff(2) || x <= str.upgEff(3)
	},
	vibrate(x) {
		var vibrated = str_save.vibrated
		if (vibrated.includes(x)) {
			var new_vibrated = []
			var new_length = str_tmp.vibrated
			for (var pos = 18; pos >= 1; pos--) {
				if (vibrated.includes(pos)) {
					if (pos != x && str.protect(pos, new_length)) new_vibrated.push(pos)
					else new_length--
				}
			}
			if (str_tmp.vibrated - new_length >= 2) {
				$.notify("Prevented this action from " + getFullExpansion(str_tmp.vibrated - new_length) + " breaking down. Tip: Unvibrate the rightmost positions first!", "error")
				return
			}
			str_tmp.vibrated = new_length
			str_save.vibrated = new_vibrated
		} else {
			if (!str.canVibrate(x)) return
			vibrated.push(x)
		}
		str.updateTmp()
	
		if (str.veUnspent() < 0 || dev.noReset) str.updateDisp()
		else restartQuantum(true)
	},
	vibrated(x) {
		return str.unl() && (str_save.vibrated && str_save.vibrated.includes(x))
	},
	onVibrate(x) {
		var range = 3
		if (ff.unl()) r *= ff_tmp.eff.f4
		range = Math.floor(range)

		for (var p = -range; p <= range; p++) {
			var d = Math.abs(p)
			var y = p + x
			var add = 0.17 - 0.13 * d + 0.25 * ((d + 1) % 2)
			if (fluc.unl() && fluc_tmp.temp && add < 0) add /= fluc_tmp.temp
			str_tmp.alt[y] = (str_tmp.alt[y] || 0) + add
		}
		str_tmp.lastVibrate = Math.max(str_tmp.lastVibrate, x)
	},

	//Altitudes
	altitude(x, next) {
		if (this.disabled()) return
		let r = str_tmp.alt[x] || 0
		if (ff.unl() && ff_tmp.eff.f3) r *= ff_tmp.eff.f3
		return Math.max(Math.min(r, 1), -1)
	},
	eff(x) {
		if (!str.unl()) return 0
		let r = str_tmp.powers[Math.ceil(x / 6)]
		if (r < 0) r *= 1.5
		r *= str_tmp.str / 4
		return r
	},

	//Presets
	exportPreset() {
		let str = []
		let letters = " abcdefghijklmnopqrstuvwxyz"
		for (var i = 0; i < str_save.vibrated.length; i++) {
			var letter = letters[str_save.vibrated[i]]
			if (i % 2 == 1) letter = letter.toUpperCase()
			str += letter
		}

		copyToClipboard(str)
	},
	getPreset(x) {
		let letters = " abcdefghijklmnopqrstuvwxyz"
		let rev_letters = {}
		for (var i = 1; i <= 26; i++) rev_letters[letters[i]] = i

		let set = []
		for (var i = 0; i < x.length; i++) set.push(rev_letters[x[i].toLowerCase()])
		return set
	},
	importPreset() {
		var x = prompt("WARNING! Importing a preset will restart your Quantum run!")
		x = str.getPreset(x)

		str_save.vibrated = []
		str_save.spent = 0
		str_tmp.used = {}
		str_tmp.lastVibrate = 0
		str_tmp.vibrated = 0

		var ve = str_save.energy
		for (var i = 0; i < x.length; i++) {
			var k = x[i]
			if (str.canVibrate(k)) {
				str_save.vibrated.push(k)
				str_tmp.vibrated++
				str_tmp.used = (str_tmp.lastVibrate[Math.ceil(k / 6)] || 0) + 1
				str_tmp.lastVibrate = Math.max(str_tmp.lastVibrate, k)
				str_save.spent = str.veCost(str_tmp.vibrated)
			}
		}

		restartQuantum()
	},

	//Upgrades
	upgCost(x) {
		return str.data.upgs[x].req(this.upgLvl(x))
	},
	upgEff(x) {
		return str.data.upgs[x].eff(this.upgLvl(x))
	},
	upgLvl(x) {
		return (str_save.upgs && str_save.upgs[x]) || 0
	},
	canUpg(x) {
		let upg = str.data.upgs[x]
		return c_gte(upg.res(), this.upgCost(x))
	},
	buyUpg(x) {
		if (!str.canUpg(x)) return
		str_save.upgs[x] = str.upgLvl(x) + 1
		str.updateDisp()
	},

	//Others
	clear() {
		if (!confirm("Are you sure?")) return

		str_save.vibrated = []
		str_save.spent = 0
		restartQuantum()
	},
	disabled() {
		return !str.unl() || this.veUnspent() < 0
	}
}
let str_tmp = {}
let str_save = {}

let STRINGS = str

/* TO DO:
- NEVER ADD SOMETHING THAT WORKS LIKE VIBRATERS. IT WOULD MAKE STRINGS MORE COMPLICATED.

V1. Stretchers: Vibraters vibrate more boosts.
V2. Amplifiers: Vibraters increase the altitudes.
V3. Generators: Vibraters make charged boosts generate Vibration Energy.
V4. Stablizers: Boosts decay less from the center of Vibraters.
V5. Condensers: Vibraters cover one less boost from choosing.

S1. Shrunkers: More boosts are overlapped.
S2. Exciters: Boosts with positive altitudes are stronger.
S3. Boosters: The main boosts from strings are stronger.
	(2x stronger makes boosts act like they have 2x altitude.)
S4. Altituders: Boosts have 0.1 altitude farther away from 0.
S5. Zoomers: Altitudes are rooted by an exponent.

MIGHT SCRAP THAT:
1. Chargers: Reduce the penalties of negative altitudes.

WHY?!
B1. ???: Vibration Energy generate extra Quantum Energy.
B2. ???: Vibraters increase the quantum efficiency.
B3. ???: The closest altitude to 0 boosts ???.
B4. ???: Positronic Charge adds the efficiency of Quantum Energy in Vibration Energy gain.
B5. String Prestiges: They works like prestiges, which buffs String boosts, but reduce the altitudes.
*/
