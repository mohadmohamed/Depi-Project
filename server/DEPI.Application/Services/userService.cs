using DEPI.Application.Contracts;
using DEPI.Application.DTOs;
using DEPI.DataAccess.Contracts;
using DEPI.DataAccess.Entites;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DEPI.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly PasswordHasher<User> _passwordHasher = new();
        private readonly JwtService _jwtService;

        public UserService(IUnitOfWork unitOfWork, JwtService jwtService)
        {
            _unitOfWork = unitOfWork;
            _jwtService = jwtService;
        }

        public async Task<User> GetUserById(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            return user ?? throw new InvalidOperationException($"User with ID {id} not found");
        }

        public async Task<User> UserRegister(userRegisterDTO user)
        {
            // 1. Check if email exists
            var existingUser = (await _unitOfWork.Users.FindAsync(u => u.Email == user.Email));
            if (existingUser != null)
                throw new InvalidOperationException("Email already exists");

            // 2. Create new user
            var newUser = new User
            {
                FullName = user.fullName,
                Email = user.Email,
            };

            // 3. Hash password
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, user.password);

            // 4. Save to database
            await _unitOfWork.Users.AddAsync(newUser);
            await _unitOfWork.SaveChangesAsync();

            return newUser;
        }

        public async Task<string> UserLogin(userLoginDTO user)
        {
            // 1. Find user by email
            var foundUser = await _unitOfWork.Users.FindAsync(u => u.Email == user.Email);
            if (foundUser == null)
                throw new InvalidOperationException("Invalid email or password");

            // 2. Verify password
            bool isValid = VerifyPassword(foundUser, user.password, foundUser.PasswordHash);
            if (!isValid)
                throw new InvalidOperationException("Invalid email or password");

            // 3. Generate JWT token with null checks
            if (_jwtService == null)
                throw new InvalidOperationException("JWT service is not configured");
            
            string userId = foundUser.Id.ToString();
            string userEmail = foundUser.Email ?? throw new InvalidOperationException("User email is missing");
            
            string token = _jwtService.GenerateToken(userId, userEmail);

            return token;
        }

        public string HashPassword(User user, string password)
        {
            return _passwordHasher.HashPassword(user, password);
        }

        public bool VerifyPassword(User user, string password, string hashedPassword)
        {
            var result = _passwordHasher.VerifyHashedPassword(user, hashedPassword, password);
            return result == PasswordVerificationResult.Success;
        }
    }
}
