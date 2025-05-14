const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Configura el transporte con tu email real o cuenta de envío SMTP (usa app password si es Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'equipo.almi.a@gmail.com', // ← reemplaza
    pass: 'Almi12345' // ← reemplaza
  },
});

exports.enviarRecordatorios = functions.pubsub.schedule('0 9 * * *') // Todos los días a las 9:00 AM
  .timeZone('Europe/Madrid')
  .onRun(async (context) => {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    mañana.setHours(0, 0, 0, 0);

    const pasadoMañana = new Date(mañana);
    pasadoMañana.setDate(mañana.getDate() + 1);

    const reservasSnapshot = await db.collection('reservas')
      .where('fecha', '>=', mañana)
      .where('fecha', '<', pasadoMañana)
      .get();

    const clientesSnapshot = await db.collection('cliente').get();
    const clientes = {};
    clientesSnapshot.forEach(doc => {
      const data = doc.data();
      clientes[data.clienteId] = data;
    });

    reservasSnapshot.forEach(async (doc) => {
      const data = doc.data();
      const cliente = clientes[data.clienteId];
      if (!cliente) return;

      const mailOptions = {
        from: 'JustClick <TU_CORREO@gmail.com>',
        to: cliente.correo,
        subject: 'Recordatorio de reserva - JustClick',
        text: `Hola ${cliente.nombre}, te recordamos que tienes una reserva mañana a las ${data.hora} con tu peluquería.`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo enviado a ${cliente.correo}`);
      } catch (err) {
        console.error(`❌ Error enviando a ${cliente.correo}:`, err);
      }
    });

    return null;
  });
