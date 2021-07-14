$(document).ready(function () {
    $('.common-slider').slick({
        loop: true,
        dots: false,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: false,
    });
    $('.why_reunble_slider').each( function (slider) {
      const centered = $('.slider-item', this).length < 5
      $(this).slick({
        dots: false,
        infinite: false,
        speed: 300,
        slidesToShow: 5,
        centerMode: centered,
        slidesToScroll: 1,
        responsive: [
          {
            breakpoint: 1100,
            settings: {
              slidesToShow: 4,
            }
          },
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
            }
          }
        ]
      });
    })

    $('.community-item-lists').each( function (slider) {
      // const centered = $('.slider-item', this).length < 5
      $(this).slick({
        dots: false,
        infinite: false,
        speed: 300,
        centerPadding: '20px',
        slidesToShow: 3,
        centerMode: false,
        slidesToScroll: 1,
        responsive: [
          {
            breakpoint: 1280,
            settings: {
              slidesToShow: 2,
            }
          },
          {
            breakpoint: 640,
            settings: {
              slidesToShow: 1,
            }
          }
        ]
      });
    })
});
