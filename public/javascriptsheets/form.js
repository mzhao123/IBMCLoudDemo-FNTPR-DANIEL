function updateOther() //makes sure that certain text boxes are required if a certain checkbox is filled
{

  if(document.getElementById("adminSpecify").required == true)
  {
    document.getElementById("adminSpecify").required = false;
  }
  else
  {
    document.getElementById("adminSpecify").required = true;
  }

}
function updateAnother()
{
  if(document.getElementById("useOther").required == true)
  {
    document.getElementById("useOther").required = false;
  }
  else
  {
    document.getElementById("useOther").required = true;
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
} else
{
 countfield.value = maxlimit - field.value.length;
}
}
//creating the vuejs for the 3 divs
window.onload = function()
{
  //NEW
 var charLeft = new Vue(
 {
    el: "#charsLeft",
    data:
    {				theCharactersLeft: '',
            answer: "2000"
    },
    watch:
    {
            theCharactersLeft: function(newTheCharactersLeft, oldTheCharactersLeft)
            {
              var theCharsLeft = this.getChar();
              this.answer = theCharsLeft;
            }
    },
    methods:
    {
        getChar:function()
        {
            return (2000 - this.theCharactersLeft.length);
        }
    }
 })
 //NEW
 var charLeft2 = new Vue(
 {
    el: "#charsLeft2",
    data:
    {				theCharactersLeft: '',
            answer: "2000"
    },
    watch:
    {
            theCharactersLeft: function(newTheCharactersLeft, oldTheCharactersLeft)
            {
              var theCharsLeft = this.getChar();
              this.answer = theCharsLeft;
            }
    },
    methods:
    {
        getChar:function()
        {
            return (2000 - this.theCharactersLeft.length);
        }
    }
 })
 var charLeft3 = new Vue(
{
   el: "#charsLeft3",
   data:
   {				theCharactersLeft: '',
           answer: "2000"
   },
   watch:
   {
           theCharactersLeft: function(newTheCharactersLeft, oldTheCharactersLeft)
           {
             var theCharsLeft = this.getChar();
             this.answer = theCharsLeft;
           }
   },
   methods:
   {
       getChar:function()
       {
           return (2000 - this.theCharactersLeft.length);
       }
   }
})
var list = new Vue(
{
  el: '#vueList',
  data:
  {
    items:
    [
        {example: 'Meal Services'},
        {example: 'Transportation Services'},
        {example: 'Caregiver support services'},
        {example: 'Adult day programs'},
        {example: 'Home maintenance and repair services'},
        {example: 'Friendly visiting services'},
        {example: 'Security checks or reassurance services'},
        {example: 'Social or recreational services'},
        {example: 'First Nations/Indigenous support'},
        {example: 'Client intervention and assistance'},
        {example: 'Emergency response'},
        {example: 'Foot care'},
        {example: 'Home help referral'},
        {example: 'Independence training'},
        {example: 'Palliative care education and consultation'},
        {example: 'Psycho-geriatric consulting services related to Alzheimer disease and dementia'},
        {example: 'Public education services relating to Alzheimer disease and dementia'},
        {example: 'Services for persons with blindness/visual impairment'},
        {example: 'Services for persons with deafness/congenital/acquired hearing loss'}
    ]
  }
})
}

function getRemainingFunds()
{
if(document.getElementById("fundProvided").value != null && document.getElementById("fundSpent").value != null)
{
  if(document.getElementById("fundProvided").value - document.getElementById("fundSpent").value >= 0)
  {
    document.getElementById("fundRecovered").value = (document.getElementById("fundProvided").value - document.getElementById("fundSpent").value) ;
  }

}
}
