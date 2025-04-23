function updateConvertSave(convertMod) {
	var convert;
	var conversionText;
	if (convertMod === "NG+3") {
		convert = true;
		conversionText = "Convert to NG+3";
	} else
		convert = false;
	el("convertSave").style.display = convert ? "" : "none";
	el("convertSave").textContent = conversionText;
}

function eligibleConvert() {
	if ((tmp.ngpX == 0 || tmp.ngpX == 2) && tmp.ngmX == 0 && !tmp.bgMode && !tmp.exMode && !player.boughtDims && !player.infinityUpgradesRespecced) {
		convert = "NG+3";
	} else
		convert = undefined;
	return convert;
}

function convertSave(conversion) {
	if (conversion === "NG+3") {
		if (!confirm("Upon converting to NG+3R, this save will no longer be able to be reverted back into its original state. It is recommended to export before converting, so that you don't lose anything upon conversion. Are you sure you want to convert this save to NG+3?"))
			return;
		clearInterval(gameLoopIntervalId);
		doNGPlusTwoNewPlayer();
		doNGPlusThreeNewPlayer();
		set_save(metaSave.current, player);
		reload();
		$.notify("Conversion successful", "success");
	}
}
