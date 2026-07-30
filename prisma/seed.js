const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");
  
  // Clear DB
  await prisma.comment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.user.deleteMany({});

  const employeePassword = bcrypt.hashSync("password123", 10);
  const itPassword = bcrypt.hashSync("password123", 10);

  const employee = await prisma.user.create({
    data: {
      email: "employee@company.com",
      password: employeePassword,
      name: "Alex Turner",
      role: "EMPLOYEE",
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: "employee2@company.com",
      password: employeePassword,
      name: "Sarah Jenkins",
      role: "EMPLOYEE",
    },
  });

  const itStaff = await prisma.user.create({
    data: {
      email: "it@company.com",
      password: itPassword,
      name: "Michael Scott",
      role: "IT_STAFF",
    },
  });

  const ticket1 = await prisma.ticket.create({
    data: {
      title: "Broken Laptop Screen",
      description: "Screen cracked when taking the laptop out of the bag. The display is not showing anything.",
      category: "HARDWARE",
      priority: "HIGH",
      status: "OPEN",
      userId: employee.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: "VPN Connection Disconnecting",
      description: "VPN connection keeps dropping constantly while working from home. Error code: 803.",
      category: "NETWORK",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      userId: employee.id,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: "Outlook License Expired Error",
      description: "Getting 'Your Microsoft Office license has expired' error prompt when launching Outlook.",
      category: "SOFTWARE",
      priority: "LOW",
      status: "RESOLVED",
      userId: employee.id,
    },
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      title: "Wireless Mouse Unresponsive",
      description: "Cursor does not move despite replacing the batteries. USB receiver might not be detected.",
      category: "HARDWARE",
      priority: "LOW",
      status: "OPEN",
      userId: employee2.id,
    },
  });

  // Comments
  await prisma.comment.create({
    data: {
      content: "A replacement laptop is being prepared and will be delivered today.",
      userId: itStaff.id,
      ticketId: ticket1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Please restart your home router/modem and attempt to reconnect.",
      userId: itStaff.id,
      ticketId: ticket2.id,
    },
  });

  console.log("Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
