## MODELS
- User Schema
  - id  (Number)
  - firstName (String)
  - lastName (String)
  - Email (String)
  - createdAt (Date)


<!-- - Billing Schema
  - id (Number)
  - userId
  - cardName (String)
  - cardNumber (Number)
  - cardCVC (Number)
  - cardExpMonth (Number)
  - cardExpYear (Number)
  - createdAt
  - lastUpdatedAt
 -->

- Transaction Schema
  - id (Number)
  - createdAt (Date)
  - expiresAt (Date)
  - userId (Number)
  - transactionId (Number)
  - amount (Number)
  - stripeResponse


## USER ACCOUNTS
- Registration
  - Name
  - Email
  - Password
  - Confirm Password
- Login
  - Email
  - Password
- Password Recovery
  - Email
- Profile view
  - payment history
  - billing information

## CHECKOUT PROCESS
- Register
  - Checkout
    - Billing information
      - Checkout
- Login
  - Billing information
    - Checkout
  - Use current billing
    - Checkout

## Service Expiration
- Helper method that checks date/token within the transaction and or token in transaction
