let geocity = document.getElementById("geo-city");
let timenow = document.querySelector(".geo-time");
let temperature = document.querySelector(".tempe");
let description = document.querySelector(".desc");
let pressure = document.querySelectorAll(".hpa");
let humidity = document.querySelectorAll(".perc");
let speed = document.querySelectorAll(".m-s");
let uvindex = document.querySelector(".u-v");
let hourImages = document.querySelectorAll(".today1-img");
let hourTemp = document.querySelectorAll(".today1-temp");
let hourTime = document.querySelectorAll(".today1-hour");
let dayImages = document.querySelectorAll(".day-img");
let weekday = document.querySelectorAll(".week-day");
let weekdate = document.querySelectorAll(".week-date");
let weekmonth = document.querySelectorAll(".week-month");
let weekdaymax = document.querySelectorAll(".week-day-max");
let weekdaymin = document.querySelectorAll(".week-day-min");
let windeg = document.querySelector("#windeg p");
const city = document.getElementById("nameofcity");

const forNext7days = document.getElementById("for-next7days");

document.querySelector(".next-7days").addEventListener("click",()=>{
    document.querySelector(".right").classList.add("active");
})

document.querySelector(".arrow-back").addEventListener("click",()=>{
    document.querySelector(".right").classList.remove("active");
})
city.addEventListener("submit",(e)=>{
    e.preventDefault();
    const cityname = e.target[0].value;
    getlatandlon(cityname);
})


var daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

const date = new Date();
const hours = date.getHours();
var min = date.getMinutes();
var day = date.getDay();
var d = date.getDate();
if(min <10){
    min = "0"+min;
}
timenow.innerHTML = hours+":"+min;

if(hours>=18){
    document.querySelector(".top-left2").style.color = "#e7f1f6";
    document.querySelector(".top").style.backgroundImage = "url('./images/night cloud.jpg')";
}
else{
    document.querySelector(".top-left2").style.color = "black";
    document.querySelector(".top").style.backgroundImage = "url('./images/cloud.jpg')";
}

navigator.geolocation.getCurrentPosition((success) => {
    fetchdatalive(success.coords.latitude,success.coords.longitude);
},(err)=>{
    console.log(err);
});

function geticon(x){
    return "http://openweathermap.org/img/wn/" + x + "@2x.png";
}

function gethours(x){
    if(x>=24){
        x = x-24;
    }
return x;
}

function setday(x){
    if(x>6){
        x = x-7;
    }
    return daysInWeek[x];
}
function setdate(x){
    const dt = new Date();
    const month = dt.getMonth();
    const year = dt.getFullYear();
    if(month == 1){
        if(year%4==0){
            if(x>29){
                x = x - 29;
            }
        }
        else{
            if(x>28){
                x = x - 28;
            }
        }
    }
    else if((month%2 == 0 && month<=6) || (month%2 != 0 && month>=7)){
        if(x>31){
            x = x - 31;
        }
    }
    else if((month%2 != 0 && month<=6) || (month%2 == 0 && month>=7)){
        if(x>30){
            x = x - 30;
        }
    }
    return x;
}
function setmonth(x){
    const dt = new Date();
    let month = dt.getMonth();
    const year = dt.getFullYear();
    if(month == 1){
        if(year%4==0){
            if(x>29){
                x = x - 29;
                month = month + 1;
            }
        }
        else{
            if(x>28){
                x = x - 28;
                month = month + 1;
            }
        }
    }
    else if((month%2 == 0 && month<=6) || (month%2 != 0 && month>=7)){
        if(x>31){
            x = x - 31;
            month = month + 1;
        }
    }
    else if((month%2 != 0 && month<=6) || (month%2 == 0 && month>=7)){
        if(x>30){
            x = x - 30;
            month = month + 1;
        }
    }

    if(month>11){
        month = month-12;
    }
    return mS[month];
}

async function getApiKey(){
    const response = await fetch('/getApiKey')
    var apikey;
    if(response.status===200){
        const data = await response.json()
        if(data.key){
            apikey=data.key
        }
    }
    return apikey
}

let latitude;
let longitude;
async function getlatandlon(cityname){
    const key = await getApiKey();
    fetch("https://api.openweathermap.org/data/2.5/weather?q="+cityname+"&appid="+key)
    .then((res)=> res.json())
    .then((data)=> {
        geocity.innerHTML = data.name;
         latitude = data.coord.lat;
         longitude = data.coord.lon;
        fetchdatalive(latitude,longitude);
    });
}

var k=0,a=1;

async function fetchdatalive(latitude,longitude){
    const key = await getApiKey();
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat="+latitude+"&lon="+longitude+"&exclude=minutely&appid="+key+"&units=metric")
    .then((res) => res.json())
    .then((data) => {
        fetch("https://api.openweathermap.org/geo/1.0/reverse?lat="+latitude+"&lon="+longitude+"&limit=2&appid="+key)
        .then((response) => response.json())
        .then((data1) => {
            geocity.innerHTML = data1[0].name;
        }).catch(err => console.log(err));
        temperature.innerHTML = Math.floor(data.current.temp)+"°C";
        description.innerHTML = data.current.weather[0].description;
        pressure.forEach((X)=> X.innerHTML = data.current.pressure);
        humidity.forEach((X)=> X.innerHTML = data.current.humidity);
        speed.forEach((X)=> X.innerHTML = data.current.wind_speed);
        uvindex.innerHTML = data.current.uvi;
        windeg = data.current.wind_deg;
        windeg = windeg - 90;
        if(uvindex.innerHTML<=2){
            document.querySelector('.uvindex>img').src = './images/Low.jpeg';
        }
        else if(uvindex.innerHTML>2 && uvindex.innerHTML<=5){
            document.querySelector('.uvindex>img').src = './images/Medium.jpeg';
        }
        else{
            document.querySelector('.uvindex>img').src = './images/High.jpeg';
        }
        document.querySelector('#arrow').style.transform = "rotate(" + windeg + "deg)";
        hourImages.forEach((x) => {
            x.src = geticon(data.hourly[k].weather[0].icon);
            k=k+1;
            if(k==3){k=0;}
        });
        k=0;
        hourTemp.forEach((x)=>{
            x.innerHTML = Math.floor(data.hourly[k].temp);
            k=k+1;
            if(k==3){k=0;}
        });
        a=1;
        dayImages.forEach((x) => {
            x.src = geticon(data.daily[a].weather[0].icon);
            a = a+1;
        });
        a=1;
        hourTime.forEach((x)=>{
            x.innerHTML = gethours(hours+a)+":00";
            a=a+1;
            if(a==4){a=1;}
        });
        a=1;
        weekday.forEach((x) => {
            x.innerHTML = setday(day+a);
            a=a+1;
        });
        a=1;
        weekdate.forEach((x)=>{
            x.innerHTML = setdate(d+a);
            a=a+1;
        });
        a=1;
        weekmonth.forEach((x)=>{
            x.innerHTML = setmonth(d+a);
            a=a+1;
        });
        a=1;
        weekdaymax.forEach((x)=>{
            x.innerHTML = Math.floor(data.daily[a].temp.max)+1;
            a=a+1;
        });
        a=1;
        weekdaymin.forEach((x)=>{
            x.innerHTML = Math.floor(data.daily[a].temp.min);
            a=a+1;
        });
        var doc1 = data.daily[0].feels_like.morn;
        var doc2 = data.daily[0].feels_like.day;
        var doc3 = data.daily[0].feels_like.eve;
        var doc4 = data.daily[0].feels_like.night;
    
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);
        
        function drawChart() {
        var data = google.visualization.arrayToDataTable([
            ['Shift', 'Temp'],
            ['Mrng',  doc1],
            ['Noon', doc2],
            ['Eve',  doc3],
            ['Night',  doc4]
        ]);
        var options = {
            title: 'Temperature',
            curveType: 'function',
            legend: { position: 'bottom' }
        };
        var chart = new google.visualization.LineChart(document.querySelector('.top-right'));
        chart.draw(data, options);
        }
    })
    .catch((err)=> console.log(err))
}

$(window).on("load",function(){
    $(".center").fadeOut("slow");
    $(".center").fadeIn("slow");
    $(".center").fadeOut("slow");
})

window.onload = function() {
    if(!window.location.hash) {
        window.location = window.location + '#loaded';
        window.location.reload();
    }
}

$('#Left-nav').load('left.html');