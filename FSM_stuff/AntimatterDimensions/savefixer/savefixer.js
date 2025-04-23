function fixSave() {
  var save = atob(el("brokenSave").value)
  
  var fixed = save.replace(/NaN/gi, "10")
  var stillToDo = JSON.parse(fixed)
  for (var i=0; i<stillToDo.autobuyers.length; i++) stillToDo.autobuyers[i].isOn = false
  
  el("fixed").value = btoa(JSON.stringify(stillToDo))
}