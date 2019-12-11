//BxSlider
$(document).ready(function(){
    $('.bxslider').bxSlider({
        mode: "fade",
    });
});

//Sclick
$('.quote').slick();

//Accordeon
$(".accordion" ).accordion();

$(document).ready(function(){
    $('.multiple-items').slick({
        infinite: true,
        dots: true,
        slidesToShow: 6,
        slidesToScroll: 6,
        arrows: true,
    });
});