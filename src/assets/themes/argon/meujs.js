$(document).ready(function () {
    $(document).on('focus', '.input-group.input-group-merge input', function () {
        $(this).parent().parent().parent().addClass('focused');
    });

    $(document).on('focusout', '.input-group.input-group-merge input', function () {
        $(this).parent().parent().parent().removeClass('focused');
    });

    setInterval(() => {
        $('[data-toggle="select"]').each(function (index, element) {
            let sel = $(this);
            if (!$(this).hasClass('active')) {
                $(this).select2({
                    placeholder: {
                        id: '-1', // the value of the option
                        text: $(this).attr('sel-title')
                    },
                    allowClear: true,
                    dropdownParent: $('app-modal'),
                    tags: true,
                    insertTag: function (data, tag) {
                        tag.text = `Adicionar ${tag.text}`;
                        data.push(tag);
                    }
                }).addClass('active').select2('val', '');

                // if(!$(this).val(''))
                //     $(this).val('').change();
            }

        }).change();
    }, 1000);

    $('[data-toggle="select"]').select2({
        placeholder: {
            id: '-1', // the value of the option
            text: 'Select an option'
        },
        allowClear: true,
        dropdownParent: $('app-modal'),
        tags: true,
        insertTag: function (data, tag) {
            tag.text = `Adicionar ${tag.text}`;
            data.push(tag);
        }
    });


    setInterval(() => {
        $('.datableInit').each(function (index, element) {
            if (!$(this).hasClass('initialized')) {
                $(this).addClass('initialized')

                var options = {
                    keys: !0,
                    select: {
                        style: "multi"
                    },
                    serverSide: true,
                    language: {
                        paginate: {
                            previous: "<i class='fas fa-angle-left'>",
                            next: "<i class='fas fa-angle-right'>"
                        },
                        decimal: "",
                        emptyTable: "Nenhum lançamento encontrado",
                        info: "Monstrando de _START_ até _END_ de _TOTAL_ registros",
                        infoEmpty: "",
                        infoFiltered: "(foram encontrados _MAX_ registros)",
                        lengthMenu: "Mostrar _MENU_ registros",
                        loadingRecords: "Carregando...",
                        processing: "Processando...",
                        search: "Pesquisar:",
                        zeroRecords: "Nenhum lançamento encontrado",
                    },
                };

                let oTable = $(this).DataTable(options);
                setInterval(function () {
                    oTable.draw();
                }, 1000);
            }
        });
    }, 1000);

    setTimeout(() => {
        if ($('.position').length > 0 && !detectmob())
            $('.position').height( $('.scroll-fixed').height() );
    }, 1000);

    $(window).scroll(function () {
        if ($('.position').length > 0 && !detectmob()) {
            $('.position').height( $('.scroll-fixed').height() );
            let pos = $(this).scrollTop();
            let elPos = $('.position').offset().top;
            if (pos >= elPos) {
                $('.scroll-fixed').addClass('fixed');
            } else {
                $('.scroll-fixed').removeClass('fixed');
            }
        }
    });
});

function detectmob() {
    if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
        || $(window).width() <= 1200
    ) {
        return true;
    }
    else {
        return false;
    }
}