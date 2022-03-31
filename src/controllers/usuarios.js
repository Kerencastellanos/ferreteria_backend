const { request, response } = require("express");
const { PrismaClient } = require("@prisma/client");
const { cleanObj } = require("../helpers/funciones");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
exports.update = async (req = request, res = response) => {
  const { id } = req.user;
  if (req.files[0].filename) {
    let usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        imagenUrl: true,
      },
    });
    if (usuario.imagenUrl) {
      // borra de s3
      //fs.unlinkSync(path.join(__dirname, `../../uploads/${usuario.imagenUrl}`));
    }
  }
  req.body = cleanObj(req.body);
  try {
    const usuario = await prisma.usuario.update({
      data: {
        ...req.body,
        imagenUrl: req.files[0].location,
      },
      where: {
        id,
      },
      select: {
        correo: true,
        id: true,
        imagenUrl: true,
        nombre: true,
      },
    });
    usuario.imagenUrl =
      usuario.imagenUrl && `${process.env.APP_URL}/${usuario.imagenUrl}`;
    res.json({ usuario });
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.me = async (req = request, res = response) => {
  const { correo } = req.user;
  const usuario = await prisma.usuario.findUnique({
    select: {
      nombre: true,
      correo: true,
      imagenUrl: true,
      telefono: true,
      bloque: true,
      ciudad: true,
      colonia: true,
      direccion: true,
      latitude: true,
      longitude: true,
    },
    where: { correo },
  });
  usuario.imagenUrl =
    usuario.imagenUrl && `${process.env.APP_URL}/${usuario.imagenUrl}`;
  res.json({ usuario });
};

exports.obtenerCliente = async (req = request, res = response) => {
  let usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      correo: true,
      imagenUrl: true,
      telefono: true,
      bloque: true,
      ciudad: true,
      colonia: true,
      direccion: true,
      longitude: true,
      latitude: true,
    },
    where: { tipo: "cliente" },
  });
  usuarios = usuarios.map((u) => {
    if (u.imagenUrl) {
      u.imagenUrl = `${process.env.APP_URL}/${u.imagenUrl}`;
    }
    return u;
  });
  res.json({ usuarios });
};
