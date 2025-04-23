/*
To make a new softcap using this function
1) Create an element of softcap_data which contains
  - The name of it (string, used in displays only)
  - Integers starting from 1 which are dicts
    - These dicts contains a function name, starting value
      and other variables from softcap_vars based on which function you choose
2) Add to getSoftcapAmtFromId like the other functions, except after the =>
   put whatever function takes the output result of said softcap (to see which ones were active)
3a) In updateSoftcapStatsTab add a entry like the others with a name
3b) Go to index.html and find were all the others are stored and store it in a similar fasion
4) Smile :)
*/

var softcap_data = {
	tt: {
		name: "TT production",
		1: {
			func: "dilate",
			start: E(1e69 / 2e4),
			base: 10,
			pow: 2/3,
			mul: () => (tmp.bgMode ? 1.25 : 1.5),
			sub10: 68 - Math.log10(2e4)
		},
		2: {
			func: "dilate",
			start: () => E(PCs.milestoneDone(73) ? 1/0 : 3e79),
			base: 10,
			pow: 3/4
		},
	},
	rep: {
		name: "effective Replicantis",
		1: {
			func: "pow",
			start: Decimal.pow(10, 2e7),
			pow: 0.5
		},
	},
	eu2: {
		name: "Eternity Upgrade 2",
		1: {
			func: "dilate",
			start: Decimal.pow(10, 1e9),
			base: 10,
			mul: (x) => Math.log10(x.log10() / 1e9 + 10),
			pow: 3/5
		},
	},
	rInt: {
		name: "base replicate interval",
		1: {
			func: "log",
			start: E(1e5),
			pow: 2.5,
			mul: 20
		},
	},
	ts83: {
		name: "TS83 multiplier",
		1: {
			func: "pow",
			start: E("1e5000"),
			pow: 0.1,
			derv: false
		}
	},
	ts225: {
		name: "base TS225 galaxies",
		1: {
			func: "pow",
			start: 100,
			mul: 0.5,
			pow: (x) => Math.min(Math.max(
				Math.log10(x + 1) / 5 - 1
			, 1/4), 2/3),
			derv: false
		}
	},
	ec14: {
		name: "EC14 base interval",
		1: {
			func: "log",
			start: E(1e12),
			pow: 5,
			mul: 5
		},
	},
	ma: {
		name: "effective meta-antimatter",
		1: {
			func: "pow",
			start: () => E(Number.MAX_VALUE).pow((enB.active("pos", 2) && enB_tmp.eff.pos2.igal_softcap) || 1),
			pow(x) {
				let l2 = Decimal.log(x, 2)
				return 1 / (Math.log2(l2 / softcap_data.ma[1].start().log(2)) / 4 + 2)
			},
			derv: false
		},
	},
	it: {
		name: "base Infinite Time reward",
		1: {
			func: "dilate",
			start: Decimal.pow(10, 90000),
			base: 10,
			pow: 0.5
		}
	},
	rp: {
		name: "Red power effect",
		1: {
			func: "log",
			start: 1.5,
			base: 1.5,
			pow: 1,
			mul: 0.25,
			add: 1.25
		}
	},
	gp: {
		name: "Green power effect",
		1: {
			func: "pow",
			start: 3,
			pow: 0.5,
			mul: 0.5
		}
	},

	//NG Condensed
	nds_ngC: {
		name: "Normal Dimensions (NG Condensed)",
		1: {
			func: "pow",
			start() {
				let x = 1e50
				if (hasTimeStudy(63)) x = tsMults[63]().times(x)
				return x
			},
			pow() {
				return hasTimeStudy(63) ? Math.sqrt(1/3) : 1/3
			},
			derv: false,
		},
		2: {
			func: "pow",
			start() {
				let x = Number.MAX_VALUE
				if (hasTimeStudy(63)) x = tsMults[63]().times(x)
				return x
			},
			pow() {
				return hasTimeStudy(63) ? Math.sqrt(1/4) : 1/4
			},
			derv: false,
		},
		3: {
			func: "pow",
			start: E("1e10000"),
			pow: 1/7,
			derv: false,
		},
		4: {
			func: "pow",
			start: E("1e25000000"),
			pow: 1/11,
			derv: false,
		}
	},
	ts_ngC: {
		name: "Tickspeed (NG Condensed)",
		1: {
			func: "pow",
			start: Number.MAX_VALUE,
			pow() {
				return player.challenges.includes("postcngc_2") ? 2/5 : 1/3
			},
			derv: false,
		},
		2: {
			func: "pow",
			start: E("1e1000"),
			pow() {
				return player.challenges.includes("postcngc_2") ? 13/40 : 1/4
			},
			derv: false,
		},
		3: {
			func: "pow",
			start: E("1e25000"),
			pow: 1/7,
			derv: false,
		},
	},
	sac_ngC: {
		name: "Sacrifice (NG Condensed)",
		1: {
			func: "pow",
			start: 1e25,
			pow() {
				return hasTimeStudy(196) ? Math.pow(1/3, .2) : 1/3
			},
			derv: false,
		},
		2: {
			func: "pow",
			start: Number.MAX_VALUE,
			pow() {
				return hasTimeStudy(196) ? Math.pow(1/4, .2) : 1/4
			},
			derv: false,
		},
	},
	ip_ngC: {
		name: "Infinity Points (NG Condensed)",
		1: {
			func: "pow",
			start: 1e10,
			pow() {
				let x = .5
				if (player.challenges.includes("postc6")) x = 7/8
				if (hasTimeStudy(181)) x = Math.pow(x, .1)
				return x
			},
			derv: false,
		},
		2: {
			func: "pow",
			start: 1e30,
			pow() {
				let x = 1/3
				if (player.challenges.includes("postc6")) x = 5/6
				if (hasTimeStudy(181)) x = Math.pow(x, .1)
				return x
			},
			derv: false,
		},
		3: {
			func: "pow",
			start: E("1e10000"),
			pow() {
				return hasTimeStudy(181) ? Math.pow(1/4, .1) : 1/4
			},
			derv: false,
		},
		4: {
			func: "pow",
			start: E("1e100000"),
			pow: 1/5,
			derv: false,
		},
		5: {
			func: "pow",
			start: E("1e950000"),
			pow: 1/23,
			derv: false,
		},
	},
	ids_ngC: {
		name: "Infinity Dimensions (NG Condensed)",
		1: {
			func: "pow",
			start: E("1e7500"),
			pow: 0.1,
			derv: false,
		},
		2: {
			func: "pow",
			start: E("1e50000"),
			pow: 0.08,
			derv: false,
		},
	},
	rep_ngC: {
		name: "Replicanti in Replicanti to Infinity Point amount (NG Condensed)",
		1: {
			func: "pow",
			start: 1e6,
			pow: 1/2,
			derv: false,
		},
		2: {
			func: "log",
			start: 1e9,
			mul: Math.sqrt(1e9) / 9,
			pow: 2,
		},
	},
	ep_ngC: {
		name: "Eternity Points (NG Condensed)",
		1: {
			func: "pow",
			start: 1e10,
			pow: 1/2,
			derv: false,
		},
		2: {
			func: "pow",
			start: 1e100,
			pow: 1/3,
			derv: false,
		},
		3: {
			func: "pow",
			start: E(Number.MAX_VALUE),
			pow: 1/4,
			derv: false,
		},
		4: {
			func: "pow",
			start: E("1e800"),
			pow: 1/7,
			derv: false,
		},
	},
	tds_ngC: {
		name: "Time Dimensions (NG Condnesed)",
		1: {
			func: "pow",
			start: E("1e5000"),
			pow: 1/3,
			derv: false,
		},
	},
	dt_ngC: {
		name: "Dilated Time (NG Condnesed)",
		1: {
			func: "pow",
			start: E(1e6),
			pow: 1/2,
			derv: false,
		},
		2: {
			func: "pow",
			start: E(1e100),
			pow: 1/3,
			derv: false,
		},
		3: {
			func: "pow",
			start: E("1e2000"),
			pow: 1/4,
			derv: false,
		},
	},
	tp_ngC: {
		name: "Tachyon Particles (NG Condensed)",
		1: {
			func: "pow",
			start: E(1e10),
			pow: 1/3,
			derv: false,
		},
		2: {
			func: "pow",
			start: E(Number.MAX_VALUE),
			pow: 1/4,
			derv: false,
		},
	},

	//NG-x Hell:
	ids_ngm4: {
		name: "infinity dimension multiplier (NG-4)",
		1: {
			func: "pow",
			start: E(1e40),
			pow: .8,
			derv: true
		}
	}
}

var softcap_vars = {
	pow: ["start", "pow", "derv"],
	dilate: ["start", "base", "pow", "mul", "sub10"],
	log: ["start", "base", "pow", "mul", "add"],
	logshift: ["shift", "pow", "add"]
}

var softcap_funcs = {
	pow(x, start, pow, derv = false) {
		x = Math.pow(x / start, pow)
		if (derv && pow != 0) x = (x - 1) / pow + 1
		x *= start
		return x
	},
	pow_decimal(x, start, pow, derv = false) {
		x = Decimal.div(x, start).pow(pow)
		if (derv && pow != 0) x = x.sub(1).div(pow).add(1)
		x = x.times(start)
		return x
	},
	log(x, start, base = 10, pow = 1, mul = 1, add = 0) {
		if (x <= start) return x

		let x2 = Math.pow(Math.log10(x) / Math.log10(base) * mul + add, pow)
		return Math.min(x, x2)
	},
	log_decimal(x, start, base = 10, pow = 1, mul = 1, add = 0) { 
		if (x.lte(start)) return x

		let x2 = Decimal.pow(x.log(base) * mul + add, pow)
		return Decimal.min(x, x2)
	},
	logshift: function (x, shift, pow, add = 0){
		let x2 = Math.pow(Math.log10(x * shift), pow) + add
		return Math.min(x, x2)
	},
	logshift_decimal: function (x, shift, pow, add = 0){
		let x2 = Decimal.pow(x.times(shift).log10(), pow).add(add)
		return Decimal.min(x, x2)
	},
	dilate(x, start, base = 10, pow = 1, mul = 1, sub10 = 0) { 
		if (x <= start) return x

		var x_log = Math.log(x) / Math.log(base)
		var start_log = Math.log(start) / Math.log(base)

		var sub = sub10 / Math.log10(base)
		x_log -= sub
		start_log -= sub

		return Math.pow(base, (Math.pow(x_log / start_log, pow) * mul - mul + 1) * start_log + sub)
	},
	dilate_decimal(x, start, base = 10, pow = 1, mul = 1, sub10 = 0) { 
		if (x.lte(start)) return x

		var base_log = Decimal.log10(base)
		var x_log = x.log10() / base_log
		var start_log = start.log10() / base_log

		var sub = sub10 / base_log
		x_log -= sub
		start_log -= sub

		return Decimal.pow(base, (Math.pow(x_log / start_log, pow) * mul - mul + 1) * start_log + sub)
	},
}

function do_softcap(x, data, num) {
	var data = data[num]
	if (data === undefined) return "stop"

	var func = data.func
	var vars = softcap_vars[func]

	var start = 0
	var v = [data[vars[0]], data[vars[1]], data[vars[2]], data[vars[3]], data[vars[4]], data.active]
	for (let i = 0; i < 6; i++) {
		if (typeof v[i] == "function") v[i] = v[i](x)
		if (vars[i] == "start") start = v[i]
	}

	if (v[6] === false) return x //DO NOT change to if (!v[6])  cause we DONT want undefined to return on this line

	var decimal = false
	var canSoftcap = false
	if (x.l != undefined || x.e != undefined) decimal = true
	if (!start || (decimal ? x.gt(start) : x > start)) canSoftcap = true

	if (canSoftcap) return softcap_funcs[func + (decimal ? "_decimal" : "")](x, v[0], v[1], v[2], v[3], v[4])
	return "stop"
}

function softcap(x, id) { 
	/* 
	if you only want to do a certain number of softcaps,
	change some softcaps to just not being active
	*/
	var data = softcap_data[id]
	if (data == undefined) {
		console.log("your thing broke at " + id)
		return
	}

	var sc = 1
	var stopped = false
	while (!stopped) {
		var y = do_softcap(x, data, sc)
		sc++
		if (y !== "stop") x = y
		else stopped = true
	}
	return x
}

function getSoftcapName(id){
	return softcap_data[id]["name"] || "yeet fix bugs pls"
}

function getSoftcapAmtFromId(id){
	return { // for amount
		rep: () => getReplEff(),
		rInt: () => tmp.rep ? tmp.rep.baseBaseEst.pow(1 - getECReward(14)) : E(1),
		it: () => tmp.it.max(1),
		eu2: () => ETER_UPGS[2].mult(),
		ec14: () => tmp.rep ? tmp.rep.ec14.baseInt : E(1),
		tt: () => getTTGenPart(player.dilation.tachyonParticles),
		ts83: () => tsMults[83](),
		ts225: () => tsMults[225](),
		ma: () => getExtraDimensionBoostPowerUse(),
		rp: () => colorBoosts.r,
		gp: () => colorBoosts.g,

		// Condensened: () =>
		nds_ngC: () => getDimensionFinalMultiplier(1),
		ts_ngC: () => getTickspeed().pow(-1),
		sac_ngC: () => calcTotalSacrificeBoost(),
		ip_ngC: () => getInfinityPointGain(),
		ids_ngC: () => getBestUsedIDPower(),
		rep_ngC: () => player.replicanti.amount,
		ep_ngC: () => gainedEternityPoints(),
		tds_ngC: () => getTimeDimensionPower(1),
		dt_ngC: () => getDilatedTimeGainPerSecond(),
		tp_ngC: () => player.dilation.tachyonParticles,

		//NGmX

		ids_ngm4: () => getBestUsedIDPower(),
		//this is actually wrong, need to make sure to only take the softcaps of the ones you have unlocked--make a function for it
	}[id]()

}

function hasSoftcapStarted(id, num){
	let l = id.length
	let check = { 
		/*
		this is where you need to put anything else that needs to be true
		that is: if it is false it does not display, but if it is true,
		it continues as if nothing happens
		NOTE: this excludes Big Rip, and other endings that are at the end of words 
		This currently includes: _ngC, _dilation, _ngmX for integers of length 1 X
		*/
		rep: tmp.ngp3,
		rInt: ECComps("eterc14"),
		it: tmp.ngp3 && tmp.it,
		eu2: tmp.ngp3,
		ts83: tmp.ngp3,
		ts225: tmp.ngp3,
		ec14: tmp.ngp3,
		rp: tmp.ngp3,
		gp: tmp.ngp3,
		tt: tmp.ngp3,
		ma: tmp.ngp3
	}
	let layers = {
		rep: QCs_tmp.qc1 ? "quantum" : "infinity",
		rInt: "quantum",
		it: "eternity",
		eu2: "eternity",
		ts83: "eternity",
		ts225: "eternity",
		ec14: "eternity",
		rp: "quantum",
		gp: "quantum",
		tt: "eternity",
		ma: tmp.quUnl ? "quantum" : ""
	}
	if (layers[id] && !pH.shown(layers[id])) return false
	if (l >= 4 && !tmp.ngC && id.slice(l - 4, l) == "_ngC") return false
	if (l >= 5 && id.slice(l - 5, l - 1) == "_ngm") {
		let int = parseInt(id[l - 1])
		if (!isNaN(int)) if (!(tmp.ngmX >= int)) return false
	}
	if (!player.dilation.active && l > 9 && id.slice(l - 9, l) == "_dilation") return false
	if (check[id] !== undefined && !check[id]) return false
	
	let amt = getSoftcapAmtFromId(id)
	return hasSoftcapStartedArg(id, num, amt)
}

function hasSoftcapStartedArg(id, num, arg){
	let a = softcap_data[id][num].active
	if (a != undefined) {
		a = evalData(a)
		if (a == false) return false
	}
	let start = softcap_data[id][num].start
	return Decimal.gt(arg, evalData(start))
}

function hasAnySoftcapStarted(id){
	for (let i = 1; i <= numSoftcapsTotal(id); i++){
		if (hasSoftcapStarted(id, i)) return true
	}
	return false
}

function numSoftcapsTotal(id){
	let a = Object.keys(softcap_data[id])
	let b = 0
	for (let i = 0; i <= a.length; i++){
		if (!isNaN(parseInt(a[i]))) b ++
		// if the name is an integer add to b
	}
	return b
}

function softcapShorten(x){
	if (typeof x == "number" && x < 1000 && x % 1 == 0) return x
	if (x < 1) return formatValue(player.options.notation, x, 3, 3)
	if (x == 1) return 1
	else return shorten(x)
}

function getSoftcapStringEffect(id, num, amt, namenum){
	let data = softcap_data[id][num]
	if (namenum == undefined) namenum = num
	if (data == undefined) return "Nothing, prb bug."
	let name = (getSoftcapName(id) || id) + " #" + namenum + "."

	var func = data.func
	var vars = softcap_vars[func]

	var v = [data[vars[0]], data[vars[1]], data[vars[2]], data[vars[3]], data[vars[4]]]
	for (let i = 0; i < 5; i++) v[i] = evalData(v[i], [amt])

	if (func == "pow"){
		let inside = "Start: " + softcapShorten(v[0]) + ", Exponent: " + softcapShorten(v[1])
		if (shiftDown) inside += (v[2] ? ", and keeps " : ", and does not keep ") + "smoothness at softcap start"
		return "Softcap of " + name + " " + inside + "."
	}
	if (func == "dilate") { // vars ["base", "pow", ...]
		let inside = "Start: " + softcapShorten(v[0]) + ", Dilate: ^" + softcapShorten(v[2]) + ", Base (log): " + softcapShorten(v[1])
		return "Softcap of " + name + " " + inside + "."
	}
	if (func == "log") { // vars ["start", "base", "pow", "mul", "add"]
		let mult = (v[3] != undefined && Decimal.neq(v[3], 1)) ? ", times: " + softcapShorten(v[3]) : ""
		let add = ""
		if (v[4] != undefined) {
			if (typeof v[4] != "number" || v[4] > 0) add = (v[4] != undefined && Decimal.neq(v[4], 0)) ? ", plus: " + softcapShorten(v[4]) : ""
			else add = (v[4] != undefined) ? ", Mminus: " + softcapShorten(-1*v[4]) : ""
		}
		let inside = "Start: " + softcapShorten(v[0]) + ", log (base " + (v[1] || 10) + ") // " + "to the Power of " + softcapShorten(v[2]) + mult + add 
		return "Softcap of " + name + " " + inside + "."
	} 
	return "oops someone messed up"
}

function getInnerHTMLSoftcap(id){
	let n = numSoftcapsTotal(id)
	let s = ""
	if (!hasSoftcapStarted(id, 1)) return ""
	let c = 1
	let amt = getSoftcapAmtFromId(id)
	for (let i = 1; i <= n; i++) {
		if (hasSoftcapStartedArg(id, i, amt)) {
			s += getSoftcapStringEffect(id, i, amt, c) + "<br>"
			c ++
		}
	}
	return s + "<br><br>"
}

function updateSoftcapStatsTab(){
	let names = {
		rep: "softcap_rep",
		rInt: "softcap_rInt",
		it: "softcap_it",
		tt: "softcap_tt",
		eu2: "softcap_eu2",
		ts83: "softcap_ts83",
		ts225: "softcap_ts225",
		ec14: "softcap_ec14",
		ma: "softcap_ma",
		rp: "softcap_rp",
		gp: "softcap_gp",
		// Condensened:
		nds_ngC: "softcap_C_nd",
		ts_ngC: "softcap_C_ts",
		sac_ngC: "softcap_C_sac",
		ip_ngC: "softcap_C_ip",
		rep_ngC: "softcap_C_rep",
		ids_ngC: "softcap_C_id",
		ep_ngC: "softcap_C_ep",
		tds_ngC: "softcap_C_td",
		dt_ngC: "softcap_C_dt",
		tp_ngC: "softcap_C_tp",
		//NGmX
		ids_ngm4: "softcap_m4_id",
	}
	let n = Object.keys(names)
	let anyActive = false

	for (let i = 0; i < n.length; i++){
		var id = n[i]
		var elname = names[id]
		var el_ = el(elname)
		var started = hasAnySoftcapStarted(id)
		if (started) {  
			el_.style = "display:block"
			el_.innerHTML = getInnerHTMLSoftcap(id)

			anyActive = true
		} else {
			el_.style = "display:none"
		}

		var elDisp = el(elname + "_disp")
		if (elDisp) elDisp.style.display = started && shiftDown ? "" : "none"
		if (started && elDisp && shiftDown) {
			var sc = 0
			var amt = getSoftcapAmtFromId(id)
			for (var j = 1; j <= numSoftcapsTotal(id); j++) {
				if (hasSoftcapStartedArg(id, j, amt)) sc++
			}
			elDisp.className = "softcap_" + sc
			elDisp.innerHTML = "(softcapped" + (sc >= 2 ? "<sup>" + sc + "</sup>" : "") + ")"
		}
	}

	el("softcapsbtn").style.display = anyActive ? "" : "none"
}
