# Security Test for the Entire Application

These are the manual security and access control tests that I've done:

---

### 1. **Access Control on the Index Page (Reservation List)**

- **Test Description**: Ensure that a user who is not logged in can view the list of reservations but cannot see the usernames of the reservers. A logged-in user (reserver or admin) should see the usernames of reservers.
- **Test Result**: 
    - A user who is not logged in can view the reservations, but usernames of reservers are hidden.
    - A logged-in reserver can see the username of his or her own reservations.
    - A logged-in admin can see all the reservers usernames.
- **Expected Behavior**: 
    - Public users can only see reservation details, but not the reserver's identity.
    - Logged-in users with reserver role can see the reservation and the reserver's own name.
    - Admins can view all reservations and reservers usernames.

---

### 2. **User Role-Based Access Control for Deleting Reservations**

- **Test Description**: Ensure that a reserver can only delete their own reservations. Admin users should have the ability to delete any reservation.
- **Test Result**: 
    - A public user can't delete any reservations.
    - A reserver can only delete their own reservation.
    - An admin can delete any reservation.
- **Expected Behavior**: 
    - Public users can not delete reservations.
    - Reserver users can only delete their own reservations.
    - Admin users have the ability to delete any reservation from any user.

---

### 3. **Reservation Availability Check**

- **Test Description**: Ensure that a user cannot make a reservation if the selected resource is already reserved during the specified time range.
- **Test Result**: 
    - If a resource is already reserved at the selected start and end date, the system prevents new reservations for that resource and shows an error message.
- **Expected Behavior**: 
    - The system should prevent double bookings by checking for overlapping reservations for the same resource during the selected time range.

---

### 4. **Age Restriction for Reservation**

- **Test Description**: Ensure that users under 15 years old cannot make a reservation.
- **Test Result**: 
    - Users aged 15 or above can make reservations.
    - Users below the age of 15 are prevented from making reservations, and an error message is displayed.
- **Expected Behavior**: 
    - Only users who are 15 years old or older should be able to reserve a resource.

---

### 5. **Login Page Authentication**

- **Test Description**: Ensure that users can only log in with the correct username and password combination.
- **Test Result**: 
    - Only users with the correct password can log in successfully. Incorrect passwords prevent login.
- **Expected Behavior**: 
    - Users should only be able to log in with the correct credentials.

---

### 6. **Registration Page Validation**

- **Test Description**: Ensure that new users can register and that the system validates the registration process (e.g., no duplicate usernames).
- **Test Result**: 
    - A new user can register successfully, provided the username is unique.
    - If the username already exists, an error message is displayed.
- **Expected Behavior**: 
    - New users can register if the username is not taken.
    - The system should handle registration errors and show appropriate messages.

---

### 7. **Admin Access Control on Resources Page**

- **Test Description**: Ensure that only an admin user has access to the resources page. Admin users should be able to add and delete resources.
- **Test Result**: 
    - Only users with an admin role can access the resources page.
    - Admins can add new resources
    - Admins can also delete resources.
- **Expected Behavior**: 
    - Admin users should have exclusive access to the resources page and be able to add, delete, or manage resources.
    - Non-admin users should not be able to access or modify resources.

---

### 8. **Duplicate Resource Prevention**

- **Test Description**: Ensure that a resource with the same name cannot be added multiple times by admins.
- **Test Result**: 
    - If an admin attempts to add a resource with a name that already exists, the system prevents it and shows an error message.
- **Expected Behavior**: 
    - The system should ensure resource names are unique and prevent duplicates from being added.

### Conclusion: Manual Security Test

All the security and access control mechanisms outlined above have been tested and work as expected. During the security testing phase, no major vulnerabilities were found. All known security concerns, such as access control, reservation availability checks, and age restrictions, have been addressed and tested. Additionally, no critical security issues were uncovered in the authentication or authorization mechanisms.

---

## Important Security Vulnerabilities and How to Fix Them

Although no critical vulnerabilities were found in the current system, it's important to be aware of common security vulnerabilities that could impact any application. Below are the 5 important security-related vulnerabilities that a system can have, along with an explanation of why they should be fixed and how to mitigate them:

### 1. **Cross-Site Scripting (XSS)**

- **What is it?**: XSS vulnerabilities occur when an attacker injects malicious scripts (usually JavaScript) into web pages, which are then executed in the context of another user's browser. This can allow attackers to steal session cookies, manipulate the DOM, or deface the website.
  
- **Why is it important?**: XSS can lead to serious issues like session hijacking, data theft, and unauthorized actions being performed on behalf of the victim.
  
- **How to fix it?**:
  - Sanitize all user inputs before displaying them in the web page.
  - Implement Content Security Policy (CSP) headers to restrict the execution of scripts.

### 2. **SQL Injection**

- **What is it?**: SQL injection occurs when user input is directly inserted into SQL queries without proper sanitization, allowing attackers to manipulate the query and potentially access, modify, or delete data in the database.
  
- **Why is it important?**: SQL injection is one of the most common and dangerous vulnerabilities that can lead to full system compromise, exposing sensitive data and potentially causing data loss.
  
- **How to fix it?**:
  - Always use parameterized queries or prepared statements to avoid directly embedding user input into SQL queries.
  - Avoid using dynamic SQL queries that concatenate user input.
  
### 3. **Cross-Site Request Forgery (CSRF)**

- **What is it?**: CSRF occurs when an attacker tricks a logged-in user into making a request (such as deleting a reservation) without the user's consent or knowledge. This can be exploited by embedding malicious links or forms on another website.
  
- **Why is it important?**: CSRF attacks can lead to unintended actions being performed on behalf of authenticated users, potentially causing data loss or manipulation.
  
- **How to fix it?**:
  - Use anti-CSRF tokens (such as `X-CSRF-Token`) in all forms and AJAX requests that modify server data.
  - Ensure that every state-changing request (like `POST`, `PUT`, or `DELETE`) includes a unique CSRF token to verify that the request was intentional.
  - Validate the `Origin` and `Referer` headers to ensure requests are coming from legitimate sources.

### 4. **Broken Authentication**

- **What is it?**: Broken authentication occurs when a system fails to properly manage authentication mechanisms, such as login credentials, session tokens, or user roles. This can allow attackers to bypass authentication and gain unauthorized access to sensitive areas of the system.
  
- **Why is it important?**: Broken authentication is one of the most critical vulnerabilities, as it enables attackers to impersonate legitimate users or raise their privileges to admin level.
  
- **How to fix it?**:
  - Ensure strong password policies, including minimum length and complexity requirements.
  - Use multi-factor authentication (MFA) to add an extra layer of security.
  - Secure session management, such as using HttpOnly and Secure flags for cookies, and ensuring that session tokens expire after a reasonable time.
  - Implement account lockout mechanisms or rate-limiting to prevent brute-force attacks.

### 5. **Insecure Direct Object References (IDOR)**

- **What is it?**: IDOR occurs when an attacker is able to access or modify resources (such as user data, reservations, or files) by manipulating parameters like URLs, form data, or request headers.
  
- **Why is it important?**: IDOR vulnerabilities can expose sensitive information or allow unauthorized users to modify or delete data they shouldn't have access to, leading to data breaches or data loss.
  
- **How to fix it?**:
  - Always validate and check access control for every resource a user attempts to access. Make sure users can only access their own data or resources.
  - Use randomized or obfuscated IDs instead of predictable or sequential IDs.
