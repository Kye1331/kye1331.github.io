//Number < Infinity, Decimal > Infinity
function c_parse(a) {
	if (typeof a == "string") {
		return c_conv(E(a))
	}
	if (!a.e) return a
	a = c_conv(a)
	return a
}

function c_conv(a) {
	if (a.lt(Number.MAX_VALUE)) return Math.floor(a.toNumber())
	return a
}

function c_add(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") {
		let s=a+b
		if (s<1/0) return s
	}
	return c_conv(Decimal.add(a,b))
}

function c_sub(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a-b
	return c_conv(Decimal.sub(a,b))
}

function c_mul(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") {
		let m=a*b
		if (m<1/0) return Math.floor(m)
	}
	return c_conv(Decimal.times(a,b))
}

function c_div(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return Math.floor(a/b)
	return c_conv(Decimal.div(a,b))
}

function c_max(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return Math.max(a,b)
	if (typeof(a)=="number") return b
	if (typeof(b)=="number") return a
	return a.max(b)
}

function c_min(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return Math.min(a,b)
	if (typeof(a)=="number") return a
	if (typeof(b)=="number") return b
	return a.min(b)
}

function c_gt(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a>b
	if (typeof(a)=="number") return false
	if (typeof(b)=="number") return true
	return a.gt(b)
}

function c_gte(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a>=b
	if (typeof(a)=="number") return false
	if (typeof(b)=="number") return true
	return a.gte(b)
}

function c_eq(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a==b
	if (typeof(a)=="number") return false
	if (typeof(b)=="number") return false
	return a.eq(b)
}

function c_lte(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a<=b
	if (typeof(a)=="number") return true
	if (typeof(b)=="number") return false
	return a.lte(b)
}

function c_lt(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a<b
	if (typeof(a)=="number") return true
	if (typeof(b)=="number") return false
	return a.lt(b)
}

//Number or Decimal
function m_sub(a,b) {
	if (typeof(a)=="number"&&typeof(b)=="number") return a-b
	return Decimal.sub(a,b)
}

//Functions
function f_mul(list) { //Multiplication
	var d = E(1)
	var n = 1
	for (var i = 0; i < list.length; i++) {
		var j = list[i]
		if (j.length !== undefined) {
			if (!j[0]) continue
			j = evalData(j[1])
		}

		if (j.e !== undefined) d = d.times(j)
		else if (n * j == 1/0) {
			d = d.times(n)
			n = j
		} else n *= j
	}

	var r = n
	if (d.gt(1)) {
		r = d.times(n)
		if (r.lt(Number.MAX_VALUE)) r = r.toNumber()
	}
	return r
}