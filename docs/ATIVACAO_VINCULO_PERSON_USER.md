# Person–User Link Guarantee on Activation

## Activation and Link Flow

### 1. Look Up Person by Phone

**Process:**

1. User enters phone on the frontend (e.g. `(11) 98765-4321`)
2. Frontend normalizes by stripping formatting: `11987654321`
3. Backend receives normalized phone
4. Backend finds person by comparing normalized phones (digits only)

**Normalization:**

- Strip non-digits: `(11) 98765-4321` → `11987654321`
- Case-insensitive, format-agnostic comparison
- Accepts formatted or unformatted phones in the database

**Optimized query:**

```typescript
// Find non-deleted persons with phone
// Normalize phones in memory and compare
const person = await this.findPersonByPhone(normalizedPhone)
```

### 2. Validations Before Creating User

**Checks performed:**

1. ✅ Person exists in the database
2. ✅ Person has no linked User (`findByPersonId`)
3. ✅ Email is not in use (`findByEmail`)
4. ✅ Person belongs to access code scope
5. ✅ Access code is valid and active

### 3. Create User with Link

**Critical code:**

```typescript
const user = await this.usersService.create({
  email: dto.email,
  passwordHash,
  name: person.name,
  role: UserRole.SERVO,
  personId: person.id, // ⚠️ CRITICAL LINK
  canCheckIn: false,
})
```

**Post-create validation:**

```typescript
// Verify link was created correctly
if (!user.personId || user.personId !== person.id) {
  throw new BadRequestException('Failed to link user to person')
}

// Ensure user is active
if (!user.isActive) {
  user.isActive = true
  await this.usersService.update(user.id, { isActive: true })
}
```

### 4. Automatic Login After Activation

**Flow:**

1. User is created with linked `personId`
2. JWT is generated with User data
3. Token is stored in frontend localStorage
4. User is stored in frontend localStorage
5. `login()` updates React context
6. User is redirected to the dashboard

**Guarantees:**

- ✅ User has correct `personId`
- ✅ User has `isActive = true`
- ✅ JWT contains `sub` (userId), `email`, `role`
- ✅ Frontend has token and user saved
- ✅ React context is updated

## Link Structure

### Database Relationship

```sql
-- users table
users (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES persons(id),
  email VARCHAR UNIQUE,
  name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN DEFAULT true,
  ...
)

-- persons table
persons (
  id UUID PRIMARY KEY,
  phone VARCHAR,
  name VARCHAR,
  ...
)
```

### TypeORM Relationship

```typescript
// UserEntity
@OneToOne(() => PersonEntity, { nullable: true })
@JoinColumn({ name: 'person_id' })
person: PersonEntity | null;

@Column({ type: 'uuid', nullable: true, name: 'person_id' })
personId: string | null;

// PersonEntity
@OneToOne(() => UserEntity, { nullable: true })
user: UserEntity | null;
```

## Security Validations

### 1. Unique Phone per Person

- Each person has a unique phone
- Lookup normalizes phones before compare
- Accepts formats: `(11) 98765-4321`, `11987654321`, `+55 11 98765-4321`

### 2. Person Cannot Have Multiple Users

- Pre-create check: `findByPersonId(person.id)`
- If User exists, throw `ConflictException`
- Enforces 1:1 Person–User

### 3. Unique Email in the System

- Pre-create check: `findByEmail(email)`
- If email exists, throw `ConflictException`

### 4. Code Scope

- Person must belong to code scope (Church/Ministry/Team)
- Validated before temporary token is issued

## Logs and Monitoring

### Success Logs

```
[ActivationService] User created and linked successfully {
  userId: 'uuid',
  personId: 'uuid',
  email: 'user@example.com',
  name: 'João Silva'
}
```

### Error Logs

```
[ActivationService] Critical error: Person–User link was not created correctly {
  userId: 'uuid',
  personId: 'uuid',
  userPersonId: null
}
```

### Security Events

- `activation_check_success`: Validation succeeded
- `activation_completed`: User created successfully
- `activation_check_failed`: Validation failed (various reasons)
- `activation_complete_failed`: Failed to create User

## Troubleshooting

### Issue: "Phone not found"

**Possible causes:**

1. Phone was not imported
2. Unexpected phone format
3. Phone belongs to another person

**Fix:**

- Check person: `SELECT * FROM persons WHERE phone LIKE '%11987654321%'`
- Phones should have at least 10 digits
- Normalize manually and search again

### Issue: "This person already has an activated account"

**Possible causes:**

1. Person already has linked User
2. User was created earlier

**Fix:**

- Check link: `SELECT * FROM users WHERE person_id = 'person-uuid'`
- If User exists, person should log in normally
- If no User but error persists, check inconsistent data

### Issue: User created but cannot log in

**Possible causes:**

1. User not active (`isActive = false`)
2. Token not saved correctly
3. Person–User link missing

**Fix:**

- Check `isActive`: `SELECT is_active FROM users WHERE id = 'user-uuid'`
- Check `personId`: `SELECT person_id FROM users WHERE id = 'user-uuid'`
- Check backend logs during creation
- Check frontend localStorage (token and user)

### Issue: User created but not linked to Person in UI

**Possible causes:**

1. `personId` not persisted
2. TypeORM relation not loaded

**Fix:**

- Query DB: `SELECT person_id FROM users WHERE id = 'user-uuid'`
- Verify `personId` passed to `create()`
- Check creation logs
- Reload User from DB after creation

## Recommended Tests

### Test 1: Phone Lookup

```typescript
// Different formats
normalizePhone('(11) 98765-4321') === '11987654321'
normalizePhone('11987654321') === '11987654321'
normalizePhone('+55 11 98765-4321') === '5511987654321'
```

### Test 2: Create User with Link

```typescript
const user = await usersService.create({ ..., personId: 'person-id' });
expect(user.personId).toBe('person-id');
expect(user.isActive).toBe(true);
```

### Test 3: Login After Activation

```typescript
const loginResult = await authService.login(user.email, password)
expect(loginResult.user.personId).toBe('person-id')
expect(loginResult.token).toBeDefined()
```

## Future Improvements

1. **Normalized phone index**: Add `phone_normalized` column with index for faster lookup
2. **Lookup cache**: Cache phone lookup results
3. **Phone validation**: Validate Brazilian format (10 or 11 digits)
4. **Activation history**: Table to track all activations
