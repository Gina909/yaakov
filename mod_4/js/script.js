// Short hand array creation

var names = ["Yaakov", "jan", "barney", "Joy"];
console.log(names);
function HelloGoodbye(){
    for(var i = 0; i < names.length; i++){
        var name = names[i];
        if(name.startsWith("j")){
            console.log("Goodbye " + names[i])
        }
            else if(name.startsWith("J")){
                console.log("Goodbye " + names[i])
            }/* close inner if */
            else {
                console.log("Hello " +  names[i])
            } /* close else */
    }//close for
} //close function



































