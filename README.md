# Cybersecurity and Data Privacy - Fall 2024

This repository contains assignments and projects completed as part of the Cybersecurity and Data Privacy course at Centria University of Applied Sciences.

## Screenshots of the App

You can view some screenshots of the app in action in the following file:
[Screenshots](assets/screenshots.md)

## Dev

You need to rename `.env-template` to `.env` and fill in the missing details.

To start the Deno server:

```
deno run start
```

## Logbook

**Total hours:** 81 h

| **Date**   | **Hours** | **Description**                                           |
| :---       | :---:     | :---                                                      |
| 2024-11-02 | 2 h       | Lecture 1 and Git Repository initialization.              |
| 2024-11-02 | 1 h       | Started working with Cisco Introduction to Cybersecurity. |
| 2024-11-05 | 2 h       | Finished Module 1 in Cisco Introduction to Cybersecurity. |
| 2024-11-07 | 3 h       | Finished Module 2 in Cisco Introduction to Cybersecurity. |
| 2024-11-07 | 3 h       | Finished Module 3 in Cisco Introduction to Cybersecurity. |
| 2024-11-08 | 3 h       | Finished Module 4 in Cisco Introduction to Cybersecurity. |
| 2024-11-08 | 2 h       | Finished Module 5 and the final exam in Cisco Introduction to Cybersecurity. |
| 2024-11-10 | 1 h       | Reviewed PortSwigger's SQL Injection topic |
| 2024-11-10 | 0.5 h     | Solved PortSwigger Lab: SQL injection vulnerability in WHERE clause allowing retrieval of hidden data |
| 2024-11-10 | 0.5 h     | Solved PortSwigger Lab: SQL injection vulnerability allowing login bypass |
| 2024-11-11 | 0.5 h     | Solved PortSwigger Lab: SQL injection attack, querying the database type and version on Oracle |
| 2024-11-11 | 0.5 h     | Solved PortSwigger Lab: SQL injection attack, querying the database type and version on MySQL and Microsoft |
| 2024-11-12 | 1 h       | Started with the Booking App: Project initialization and Docker Database |
| 2024-11-13 | 0.5 h     | Solved PortSwigger Lab: SQL injection attack, listing the database contents on non-Oracle databases |
| 2024-11-13 | 1 h       | Reviewed PortSwigger's Authentication topic |
| 2024-11-13 | 0.5 h     | Solved PortSwigger Lab: Username enumeration via different responses |
| 2024-11-13 | 0.5 h     | Solved PortSwigger Lab: 2FA simple bypass |
| 2024-11-13 | 0.5 h     | Solved PortSwigger Lab: Password reset broken logic |
| 2024-11-14 | 0.5 h     | Solved PortSwigger Lab: Username enumeration via subtly different responses |
| 2024-11-14 | 0.5 h     | Solved PortSwigger Lab: Username enumeration via response timing |
| 2024-11-14 | 1 h       | Reviewed PortSwigger's Access Control topic|
| 2024-11-14 | 0.5 h     | Solved PortSwigger Lab: Unprotected admin functionality|
| 2024-11-14 | 0.5 h     | Solved PortSwigger Lab: Unprotected admin functionality with unpredictable URL|
| 2024-11-14 | 0.5 h     | Solved PortSwigger Lab: User role controlled by request parameter |
| 2024-11-14 | 0.5 h     | Solved PortSwigger Lab: User role can be modified in user profile |
| 2024-11-14 | 0.5 h     | Solved PortSwigger Lab: User ID controlled by request parameter |
| 2024-11-14 | 1.5 h     | Completed reflection on PortSwigger labs exercises |
| 2024-11-16 | 2 h       | Continued working on the Booking App: Registration page, project setup |
| 2024-11-17 | 2 h       | Continued working on the Booking App: Registration page, html and css |
| 2024-11-22 | 3 h       | Continued working on the Booking App: Registration page, more styling and touch ups |
| 2024-11-22 | 3 h       | Installed ZAP, reviewed a few tutorials on how to use ZAP. |
| 2024-11-23 | 1 h       | Performed security test on the registration page: [Registration Report 1](assets/tests/security-test-registration-page-1.md) |
| 2024-11-23 | 3 h       | Fixed the security issues detailed in Registration Report 1. I had to include correct CSP, sanitize input and output, email validation, duplicate user checks: [Registration Report 2](assets/tests/security-test-registration-page-2.md) |
| 2024-11-25 | 2 h       | Started working on the login page |
| 2024-11-26 | 5 h       | Refactored the project.. new project structure and only using Deno without Hono. |
| 2024-11-27 | 5 h       | Continued on refactoring the project. Also did the ZAP tests again on the register page after the refactor, no new vulnerabilities found. |
| 2024-11-27 | 3 h       | Finished implementing the login page. |
| 2024-11-27 | 0.5 h     | Performed security test on the login page: [Login Report 1](assets/tests/security-test-login-page-1.md) |
| 2024-12-01 | 3 h       | Fixing the security issue found in the security test "CSRF" on the login page. I added a CSRF-token to the session and validating it with a CSRF-token sent from the login form from the login page. |
| 2024-12-01 | 0.5 h     | Performed security test on the login page: [Login Report 2](assets/tests/security-test-login-page-2.md) |
| 2024-12-05 | 4 h       | Started implementing resources and reservations |
| 2024-12-06 | 4 h       | Finished implementing resources and reservations. Admins can add and delete resources. Signed in user can add and delete reservations (admins can delete all reservations and reservers can only delete their own reservations.). Unauthenticated users will only see reservations, but not who the reserver is.<br><br>Added screenshots: [Screenshots](assets/screenshots.md) |
| 2024-12-07 | 4 h       | Performed security test.<br><br>[Inde Page Report 1](assets/tests/security-test-index-page-1.md)<br>No real issues were found. Altho, i modified the code to not send the csrfToken as a URL-parameter and moved it into header insted.<br>[Inde Page Report 2](assets/tests/security-test-index-page-2.md)<br>The informational alert for the possible leaking of the csrfToken in the url was fixed.<br><br>[Resources Page Report 1](assets/tests/security-test-resources-page-1.md)<br>No real issues found. However, the *Loosely Scoped Cookie* should be fixed in a real production release.<br><br>Link to report for security test for the entire system:<br>[**System Security Test Report**](assets/tests/system-test.md) |
| 2024-12-13 | 2 h       | Implemented a Privacy Policy and Terms of Service.<br>Users needs to accept them in order to register. |
| 2024-12-13 | 1 h       | Implemented "My Account" page where users can view their information. |
| 2024-12-13 | 4 h       | Finished the Final Report, and completed 2 more PortSwigger labs. |
