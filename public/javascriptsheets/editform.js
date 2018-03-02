function updateOther() //makes sure that certain text boxes are required if a certain checkbox is filled
{
  console.log("HELOOOEEEEE IS THIS WORKING!@?");
  if(document.getElementById("adminSpecify").checked == true)
  {
    document.getElementById("adminSpecify").required = true;
  }
  else
  {
    document.getElementById("adminSpecify").required = false;
  }

}
function updateAnother()
{
  if(document.getElementById("useOther").checked == true)
  {
    document.getElementById("useOther").required = false;
  }
  else
  {
    document.getElementById("useOther").required = false;
  }
}
function textCounter( field, countfield, maxlimit )
{
  if ( field.value.length > maxlimit )
  {
    field.value = field.value.substring( 0, maxlimit );
    field.blur();
    field.focus();
    return false;
  }
  else
  {
    countfield.value = maxlimit - field.value.length;
  }
}
