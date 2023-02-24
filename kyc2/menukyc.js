function mostrarMenu(ctx) {
    const nombreUsuario = ctx.from.first_name;

    let menu = `Bienvenido al Sistema del KYC para el Bot Firewallids, ${nombreUsuario}!\n`;
    menu += 'A continuación le mostramos las preguntas que debe responder durante el proceso:\n\n';
    menu += '1. 👤 Diga su nombre completo\n';
    menu += '2. 🆔 Diga su número de identidad\n';
    menu += '5. 📞 Diga su número de teléfono\n';
    menu += '6. 📧 Diga su correo electrónico\n';
    menu += '7. 🏠 Diga su dirección particular\n';
    menu += '8. 🏢 ¿En qué provincia se encuentra su dirección?\n';
    menu += '9. 🌍 ¿Cuál es su país de origen?\n';
    menu += '10. 📄 Envíeme una foto de su documento de identidad (frente)\n';
    menu += '11. 📄 Envíeme una foto de su documento de identidad (reverso)\n';
    menu += '12. 👤 Envíeme una foto suya\n';
    menu += '13. 🖋 Envíeme una foto de su firma\n';
    menu += '14. 👨‍👩‍👧‍👦 Foto con un familiar mostrando su CI\n';
    menu += '15. 📝 Envíeme una foto de un documento de propiedad de la línea telefónica a su nombre\n';
    menu += '16. 💰 Envíeme una foto de un comprobante de depósito en el banco que coincida con su nombre y apellidos\n\n';
    menu += 'Le recomiendo que tenga todo listo antes de continuar:\n';
    menu += 'Desea iniciar el Proceso del KYC?:';

    // Botones inline para iniciar o cancelar el proceso
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '✅ Iniciar Proceso',
                        callback_data: 'iniciarkyc'
                    },
                    {
                        text: 'Cancelar Proceso ❌',
                        callback_data: 'cancelarkyc'
                    }
                ]
            ]
        }
    };

    ctx.reply(menu, options);
}

function despedida(ctx) {
    ctx.reply('Gracias por utilizar el Sistema del KYC para el Bot Firewallids. Si necesita ayuda, escriba /ayuda.');
}

module.exports = {
    mostrarMenu,
    despedida
};
 