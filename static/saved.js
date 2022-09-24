document.querySelectorAll(".dots").forEach(function(x){
    x.addEventListener("click",function(){
        this.innerHTML = "delete";
    })
});
$('#left-nav').load('left.html');

setTimeout(function(){
    document.querySelector(".alert").style.display = "none";
},500);