[Länk till showcase](https://liuonline-my.sharepoint.com/:v:/g/personal/marmo607_student_liu_se/IQDLTow_GToSR7ieQUo2C3cwASpiKwFaXhQXiBH9BTcVnJY?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=ib5ab4)

[Länk till code review](https://liuonline-my.sharepoint.com/:v:/g/personal/marmo607_student_liu_se/IQD2IWeUvNvlRKe__CPHZPlxAUaSXyeQeAZhnJYxNZ78yd4?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=4yCh1f)

# TDDD27 LiuMaster

This project was done as a part of the course TDDD27 Advanced Web Programming at Linköpings University.

## Project Idea

LiuMaster is a master program planner and social platform for students at Linköpings University. The main aim of the platform is to help students with planning their master to fit different schedule blocks, CSN requirements and workloads, while also making sure the planned master fits all the requirements for the chosen master profile. This master plan can then be used to match with other master students who have similar courses as you to set up study groups, or to find lab partners for future courses.

## Functional requirements

- Plan master profiles dynamically using the LiU API and save it on your profile.
- Account functionality such as logging in, friends, direct messaging, potentially group messaging.
- Search the database for other students, match other student's master profile plans with your own created master profile to see which courses you share.
- More as time/inspiration allows.

## Technical requirements

- Frontend built using React with TypeScript and TailwindCSS.
- Backend:
  - **Option 1:** Firebase as BaaS for database management, saving master profiles, matching profiles using cloud functions, authorization, and direct messaging/push notifications. Might be a bit limiting.
  - **Option 2:** Django as backend using an sqlite database for easy storage. For authorization either use Django authorization, or use OAuth. For direct messaging I would have to research different alternatives. There is for example Django Daphne as a websocket protocol. Might take more time to get working.

## Development plan

There are no deadlines in this development plan, it is assumed work will be done in a reasonable pace as the course progresses.

1. Get familiar with React and Firebase
2. Create a functional frontend website that can be used for testing.
3. Start implementing firebase functions such as logging in, database storage etc.
4. Create the master profile planner and implement it together with the database storage and profiles.
5. Continue developing the intricate functions of the master planner such as profile matching.
6. Implement direct messaging and friend functionality.
7. Continue as time allows.
