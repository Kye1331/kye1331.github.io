let LIGHT_SPEED = {
	mult(id) {
		let data = aarMod.ls
		return (data && data[id]) || 1
	},
	options: ["game", "rep", "dil", "tt", "tod", "gph", "bl"],
	reqs: {
		game() {
			return true
		},
		rep() {
			return player.replicanti.unl || pH.did("eternity")
		},
		dil() {
			return hasDilationStudy(1) || pH.did("quantum")
		},
		tt() {
			return hasDilationUpg(10) || pH.did("quantum")
		},
		tod() {
			return tmp.ngp3 && player.masterystudies.includes("d12")
		},
		gph() {
			return tmp.ngp3 && player.ghostify.ghostlyPhotons.unl
		},
		bl() {
			return tmp.ngp3 && player.ghostify.wzb.unl
		},
	},
	reset() {
		let shown = aarMod.ls !== undefined
		el("lstabbtn").style.display = shown ? "" : "none"
		if (!shown) return

		for (var i = 0; i < ls.options.length; i++) ls.updateOption(ls.options[i])
	},
	updateOption(id) {
		let unl = ls.reqs[id]()
		el("ls_" + id).parentElement.style.display = unl ? "" : "none"
		if (!unl) return

		let speed = ls.mult(id)
		el("ls_" + id).value = Math.round(Math.log10(speed) * 10 + 30)
		el("ls_" + id + "_text").textContent = shorten(speed)
	},
	changeOption(id) {
		let speed = Math.pow(10, el("ls_" + id).value / 10 - 3)
		el("ls_" + id + "_text").textContent = shorten(speed)
		if (speed == 1) delete aarMod.ls[id]
		else aarMod.ls[id] = speed
	},
	resetOptions() {
		if (!confirm("Are you sure do you want to reset these options? All speeds will go back to normal!")) return

		aarMod.ls = {}
		this.reset()
	}
}
let ls = LIGHT_SPEED