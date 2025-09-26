-- Create enum for semester
CREATE TYPE semester_enum AS ENUM ('Spring', 'Summer', 'Fall', 'Winter');
CREATE TABLE "person"(
    "person_id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "birthdate" DATE NOT NULL,
    "created_at" TIMESTAMP(0) WITH
        TIME zone NOT NULL
);
ALTER TABLE
    "person" ADD PRIMARY KEY("person_id");
CREATE TABLE "student"(
    "student_id" INTEGER NOT NULL,
    "enrollment_date" DATE NOT NULL,
    "major" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "student" ADD PRIMARY KEY("student_id");
CREATE TABLE "professor"(
    "professor_id" INTEGER NOT NULL,
    "salary" DECIMAL(10,2) NOT NULL
);
ALTER TABLE
    "professor" ADD PRIMARY KEY("professor_id");
CREATE TABLE "course"(
    "course_id" INTEGER NOT NULL,
    "department" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "credits" INTEGER NOT NULL
);
ALTER TABLE
    "course" ADD PRIMARY KEY("course_id");
CREATE TABLE "section"(
    "section_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "seats_available" INTEGER NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "semester" semester_enum NOT NULL,
    "year" INTEGER NOT NULL
);
ALTER TABLE
    "section" ADD PRIMARY KEY("section_id");
CREATE TABLE "exam"(
    "exam_id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "num_questions" INTEGER NOT NULL,
    "time_limit_min" SMALLINT NOT NULL,
    "instructions" TEXT NOT NULL,
    "open_date" DATE NOT NULL,
    "close_date" DATE NOT NULL
);
ALTER TABLE
    "exam" ADD PRIMARY KEY("exam_id");
CREATE TABLE "professorsection"(
    "professor_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL
);
ALTER TABLE
    "professorsection" ADD PRIMARY KEY("professor_id", "section_id");
CREATE TABLE "studentsection"(
    "student_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL
);
ALTER TABLE
    "studentsection" ADD PRIMARY KEY("student_id", "section_id");
CREATE TABLE "studentexam"(
    "student_id" INTEGER NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "taken_at" TIMESTAMP(0) WITH
        TIME zone NOT NULL,
        "grade" DECIMAL(5,2) NOT NULL,
        "duration_min" SMALLINT NOT NULL
);
ALTER TABLE
    "studentexam" ADD PRIMARY KEY("student_id", "exam_id", "taken_at");
-- Foreign key constraints with cascades
ALTER TABLE
    "student" ADD CONSTRAINT "student_student_id_foreign" FOREIGN KEY("student_id") REFERENCES "person"("person_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE
    "professor" ADD CONSTRAINT "professor_professor_id_foreign" FOREIGN KEY("professor_id") REFERENCES "person"("person_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE
    "section" ADD CONSTRAINT "section_course_id_foreign" FOREIGN KEY("course_id") REFERENCES "course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE
    "exam" ADD CONSTRAINT "exam_section_id_foreign" FOREIGN KEY("section_id") REFERENCES "section"("section_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE
    "professorsection" ADD CONSTRAINT "professorsection_professor_id_foreign" FOREIGN KEY("professor_id") REFERENCES "professor"("professor_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE
    "professorsection" ADD CONSTRAINT "professorsection_section_id_foreign" FOREIGN KEY("section_id") REFERENCES "section"("section_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE
    "studentsection" ADD CONSTRAINT "studentsection_student_id_foreign" FOREIGN KEY("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE
    "studentsection" ADD CONSTRAINT "studentsection_section_id_foreign" FOREIGN KEY("section_id") REFERENCES "section"("section_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE
    "studentexam" ADD CONSTRAINT "studentexam_student_id_foreign" FOREIGN KEY("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE
    "studentexam" ADD CONSTRAINT "studentexam_exam_id_foreign" FOREIGN KEY("exam_id") REFERENCES "exam"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Check constraints
ALTER TABLE "studentexam" ADD CONSTRAINT "grade_range" CHECK (grade >= 0);
ALTER TABLE "exam" ADD CONSTRAINT "valid_exam_dates" CHECK (close_date >= open_date);
ALTER TABLE "section" ADD CONSTRAINT "positive_seats" CHECK (seats_available >= 0);
ALTER TABLE "exam" ADD CONSTRAINT "positive_time_limit" CHECK (time_limit_min > 0);
ALTER TABLE "course" ADD CONSTRAINT "positive_credits" CHECK (credits > 0);
-- Indexes for performance
CREATE INDEX "idx_student_major" ON "student"("major");
CREATE INDEX "idx_course_department" ON "course"("department");
CREATE INDEX "idx_exam_dates" ON "exam"("open_date", "close_date");
CREATE INDEX "idx_section_semester_year" ON "section"("semester", "year");
CREATE INDEX "idx_person_email" ON "person"("email");
