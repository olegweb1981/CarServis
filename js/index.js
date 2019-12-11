//BxSlider
$(document).ready(function(){
    $('.bxslider').bxSlider({
        mode: "fade",
    });
});

//Slick
$('.quote').slick();

//Accordeon
$(".accordion" ).accordion();

//LogosSlick
$(document).ready(function(){
    $('.multiple-items').slick({
        infinite: true,
        dots: true,
        slidesToShow: 6,
        slidesToScroll: 6,
        arrows: true,
    });
});

//Dropotron
$('.nav > ul').dropotron();


//Hidden Search
function toggleMenu() {
    $(document.body).toggleClass('search-visible');
  }