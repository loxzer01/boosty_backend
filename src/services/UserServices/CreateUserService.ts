import * as Yup from "yup";
import { hash } from "bcryptjs";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import User from "../../models/User";
import Plan from "../../models/Plan";
import Company from "../../models/Company";
import { get, set } from "../../libs/cache";
import * as mailer from "nodemailer";
import CreateCompanyService from "../CompanyService/CreateCompanyService";

interface Request {
  email: string;
  password: string;
  name: string;
  queueIds?: number[];
  companyId?: number;
  profile?: string;
  whatsappId?: number;
  allTicket?: string;
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
}

const CreateUserService = async ({
  email,
  password,
  name,
  queueIds = [],
  companyId,
  profile = "admin",
  whatsappId,
  allTicket
}: Request): Promise<Response> => {
  if (companyId !== undefined) {
    const company = await Company.findOne({
      where: {
        id: companyId
      },
      include: [{ model: Plan, as: "plan" }]
    });

    if (company !== null) {
      const usersCount = await User.count({
        where: {
          companyId
        }
      });

      if (usersCount >= company.plan.users) {
        throw new AppError(
          `Número máximo de usuários já alcançado: ${usersCount}`
        );
      }
    }
  }

  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    email: Yup.string()
      .email()
      .required()
      .test(
        "Check-email",
        "An user with this email already exists.",
        async value => {
          if (!value) return false;
          const emailExists = await User.findOne({
            where: { email: value }
          });
          return !emailExists;
        }
      ),
    password: Yup.string().required().min(5)
  });

  try {
    await schema.validate({ email, password, name });
  } catch (err) {
    throw new AppError(err.message);
  }

  // const userRedis = {
  //   token: await hash(email, 8),
  //   data: {
  //     email,
  //     password,
  //     name,
  //     companyId,
  //     profile,
  //     whatsappId: whatsappId || null,
  //   allTicket
  //   },
  //   queueIds,
  //   config: { include: ["queues", "company"] }
  // }
  // await set(`email:${email}`, JSON.stringify(userRedis));

  // await sendCodeEmail(email, userRedis.token);

  const user = await User.create(
    {
      email,
      password,
      name,
      companyId,
      profile,
      whatsappId: whatsappId || null,
      allTicket
    },
    { include: ["queues", "company"] }
  );

  await user.$set("queues", queueIds);

  await user.reload();

  const serializedUser = SerializeUser(user);

  return serializedUser;
  // return;
};

export const ValidateEmailService = async (email: string, token: string) => {
  const userData = await get(`email:${email}`);
  if (!userData) throw new AppError("ERR_NO_USER_FOUND");

  const userJson = JSON.parse(userData);

  if (userJson.token !== token) throw new AppError("ERR_INVALID_TOKEN");

  //   const user = await User.create(
  //     userData.data,
  //     userData.config
  // );

  // await user.$set("queues", userData.queueIds);

  // await user.reload();

  // const serializedUser = SerializeUser(user);

  // return serializedUser;
  const company = await CreateCompanyService(userJson.data);
  return company;
};

export async function sendCodeEmail(
  email: string,
  token: string
): Promise<string> {
  try {
    // Email
    const transporter = mailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === "true" ? true : false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Validación de correo electrónico",
      html: `
        <h1>Validación de correo electrónico</h1>
        <p>Para validar tu correo electrónico, por favor ingresa en el siguiente enlace: <a href="${process.env.BACKEND_URL}/auth/validate_email?e=${btoa(email)}&t=${btoa(token)}">Validar correo electrónico</a></p>
        <p>Este enlace expirará en 24 horas.</p>
      `
    });
    return `Code send to ${email}`;
  } catch (error) {
    return `Error al enviar el mensaje a ${email}: ${error}`;
  }
}

export default CreateUserService;
