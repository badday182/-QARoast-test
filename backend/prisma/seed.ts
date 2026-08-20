import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const quizzes: Prisma.QuizCreateInput[] = [
  {
    title: 'JavaScript Fundamentals',
    questions: {
      create: [
        {
          type: 'BOOLEAN',
          text: 'JavaScript is a statically typed language.',
          order: 0,
          correctBoolean: false,
        },
        {
          type: 'BOOLEAN',
          text: '`const` prevents reassignment of a binding.',
          order: 1,
          correctBoolean: true,
        },
        {
          type: 'INPUT',
          text: 'Which operator compares value and type without coercion?',
          order: 2,
          correctText: '===',
        },
        {
          type: 'CHECKBOX',
          text: 'Which of these are primitive types?',
          order: 3,
          options: {
            create: [
              { text: 'string', isCorrect: true, order: 0 },
              { text: 'symbol', isCorrect: true, order: 1 },
              { text: 'array', isCorrect: false, order: 2 },
              { text: 'object', isCorrect: false, order: 3 },
            ],
          },
        },
        {
          type: 'CHECKBOX',
          text: 'Which array methods return a new array?',
          order: 4,
          options: {
            create: [
              { text: 'map', isCorrect: true, order: 0 },
              { text: 'filter', isCorrect: true, order: 1 },
              { text: 'push', isCorrect: false, order: 2 },
              { text: 'sort', isCorrect: false, order: 3 },
            ],
          },
        },
      ],
    },
  },
  {
    title: 'Web Basics',
    questions: {
      create: [
        {
          type: 'BOOLEAN',
          text: 'HTTP status 204 means the response has no body.',
          order: 0,
          correctBoolean: true,
        },
        {
          type: 'INPUT',
          text: 'Which HTTP method is used to remove a resource?',
          order: 1,
          correctText: 'DELETE',
        },
        {
          type: 'CHECKBOX',
          text: 'Which of these are valid CSS length units?',
          order: 2,
          options: {
            create: [
              { text: 'rem', isCorrect: true, order: 0 },
              { text: 'vh', isCorrect: true, order: 1 },
              { text: 'ch', isCorrect: true, order: 2 },
              { text: 'dpi', isCorrect: false, order: 3 },
            ],
          },
        },
      ],
    },
  },
];

async function main(): Promise<void> {
  // Idempotent: wipe first, then recreate. Questions and options go with the
  // quizzes via onDelete: Cascade.
  await prisma.quiz.deleteMany();

  for (const quiz of quizzes) {
    const created = await prisma.quiz.create({
      data: quiz,
      select: {
        id: true,
        title: true,
        _count: { select: { questions: true } },
      },
    });
    console.log(
      `seeded "${created.title}" (${created._count.questions} questions) — ${created.id}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
