var stuckTimeout
stuckTimeout = setTimeout(function(){
	showStuckPopup()
},5000)
function showStuckPopup() {
	el("stuck").style.display="block"
}