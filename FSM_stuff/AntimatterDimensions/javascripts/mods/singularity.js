let SINGULARITY = {
	main: {
		setup() {
			aarMod.ngSg = 1
			player.sing = {
				conf: true,
				times: 0,
				last10: [
					[600*60*24*31, 0],
					[600*60*24*31, 0],
					[600*60*24*31, 0],
					[600*60*24*31, 0],
					[600*60*24*31, 0],
					[600*60*24*31, 0],
					[600*60*24*31, 0],
					[600*60*24*31, 0],
					[600*60*24*31, 0],
					[600*60*24*31, 0]
				],
				time: 0,
				best: 9999999999,
				points: 0
			}
			this.save = player.sing

			SINGULARITY.dims.setup()
			SINGULARITY.blackHole.setup()
			SINGULARITY.upgs.setup()
			SINGULARITY.spaceStudies.setup()
			SINGULARITY.challs.setup()
			SINGULARITY.powers.setup()
			SINGULARITY.void.setup()
			SINGULARITY.photons.setup()
		},
		compile() {
			delete this.tmp

			let onAtPrevSave = tmp.ngSg
			tmp.ngSg = player.sing !== undefined
			this.save = player.sing

			if (tmp.ngSg || onAtPrevSave) {
				SINGULARITY.dims.compile()
				SINGULARITY.blackHole.compile()
				SINGULARITY.upgs.compile()
				SINGULARITY.spaceStudies.compile()
				SINGULARITY.challs.compile()
				SINGULARITY.powers.compile()
				SINGULARITY.void.compile()
				SINGULARITY.photons.compile()
			}

			if (!tmp.ngSg) return
		},
		can() {
			return player.dilation.active && player.infinityPoints.log10() >= 25000
		},
		reset() {
			alert("Coming soon...")
		},
		exit() {
			delete aarMod.ngSg
			delete player.sing

			this.compile()
			pH.reset()
		}
	},
	dims: {
		setup() {
			ngSg.save.dims = {
				power: 0,
				active: {}
			}
			this.save = ngSg.save.dims

			for (let d = 1; d <= 8; d++) this.save[d] = {
				amount: 0,
				bought: 0,
				power: 1
			}
		},
		compile() {
			delete this.tmp
			delete this.save

			if (!tmp.ngSg) return

			this.save = ngSg.save.dims
		},
	},
	blackHole: {
		setup() {
			ngSg.save.blackHole = {
				energy: 0,
				power: 0,
				rewards: 0
			}
			this.save = ngSg.save.blackHole
		},
		compile() {
			delete this.tmp
			delete this.save

			if (!tmp.ngSg) return

			this.save = ngSg.save.blackHole
		},
	},
	upgs: {
		setup() {
			ngSg.save.upgs = {}
			this.save = ngSg.save.upgs
		},
		compile() {
			delete this.tmp
			delete this.save

			if (!tmp.ngSg) return

			this.save = ngSg.save.upgs
		},
	},
	spaceStudies: {
		setup() {
			ngSg.save.spaceStudies = {
				theorems: {
					tt: 0,
					dt: 0,
					sp: 0,
					total: 0
				},
				studies: []
			}
			this.save = ngSg.save.spaceStudies
		},
		compile() {
			delete this.tmp
			delete this.save

			if (!tmp.ngSg) return

			this.save = ngSg.save.spaceStudies
		},
	},
	challs: {
		setup() {
			ngSg.save.challs = {}
			this.save = ngSg.save.challs

			for (let c = 1; c <= 10; c++) this.save[c] = {
				on: false,
				comps: 0
			}
		},
		compile() {
			delete this.tmp
			delete this.save

			if (!tmp.ngSg) return

			this.save = ngSg.save.challs
		},
	},
	powers: {
		setup() {
			ngSg.save.powers = {}
			this.save = ngSg.save.powers

			let types = ["inf", "eter", "sing"]
			for (let i = 0; i < types.length; i++) this.setupType(types[i])
		},
		setupType(x) {
			this.save[x] = {
				stored: [],
				active: [],
				unl: 1
			}
		},
		compile() {
			delete this.tmp
			delete this.save

			if (!tmp.ngSg) return

			this.save = ngSg.save.powers
		},
	},
	void: {
		setup() {
			ngSg.save.void = {
				on: false,
				shards: 0,
				upgrades: []
			}
			this.save = ngSg.save.void
		},
		compile() {
			delete this.tmp
			delete this.save

			if (!tmp.ngSg) return

			this.save = ngSg.save.void
		},
	},
	photons: {
		setup() {
			ngSg.save.photons = {
				amounts: [0, 0, 0, 0, 0, 0, 0],
				boosters: [0, 0, 0, 0, 0, 0, 0],
				unl: 1
			}
			this.save = ngSg.save.photons
		},
		compile() {
			delete this.tmp
			delete this.save

			if (!tmp.ngSg) return

			this.save = ngSg.save.photons
		},
	}
}

let ngSg = SINGULARITY.main