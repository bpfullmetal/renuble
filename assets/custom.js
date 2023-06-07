$(document).ready(function () {
    $('.common-slider').slick({
        loop: true,
        dots: false,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: false,
    });
    $('.why_renuble_slider').each( function (slider) {
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

    $('.quotes-slider').each( function (slider) {
      $(this).slick({
        dots: false,
        infinite: true,
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
    $('.community-item-lists').each( function (slider) {
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

    $('[id^="team-member-box___"]').click( function () {
      var id = $(this).attr('id');
      var sectionId = $(this).attr('id').split('___')[1];
      var photo = $(`#${id} img`).attr('src');
      var name = $(this).attr('data-name');
      var title = $(this).attr('data-title');
      var bio = $(this).attr('data-bio');
      var modalId = `#modal-${sectionId}`;
      $(modalId).css('visibility', 'visible');
      $(`${modalId} .image-block img`).attr('src', photo);
      $(`${modalId} .team-member-name`).text(name);
      $(`${modalId} .team-member-title`).text(title);
      $(`${modalId} .team-member-bio`).text(bio);

      $('.team-members-modal_close').click( function () {
        $(modalId).css('visibility', 'hidden');
      })
    })
});
