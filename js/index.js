//bxSlider
$(document).ready(function(){
    $('.bxslider').bxSlider({
        mode: "fade",
    });
});

//slick
$('.quote').slick();

//Accordeon
$(".accordion" ).accordion();

//logosSlick
$(document).ready(function(){
    $('.multiple-items').slick({
        infinite: true,
        dots: true,
        slidesToShow: 6,
        slidesToScroll: 6,
        arrows: true,
    });
});

//dropotron
$('.nav > ul').dropotron();


//hiddenSearch
function toggleNav() {
    $(document.body).toggleClass('search-visible');
  }

//hiddenTopBar
function toggleTopBar() {
    $(document.body).toggleClass('top-bar-visible');
  }
//arrowTopBar
function arrowTopBar() {
    $('.top-bar > img').toggleClass('active');
  }