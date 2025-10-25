using DEPI.Application.DTOs;
using DEPI.DataAccess.Entites;
using System;
using System.Threading.Tasks;

namespace DEPI.Application.Contracts
{
    public interface IUserService
    {
        Task<string> UserLogin(userLoginDTO user);
        Task<User> UserRegister(userRegisterDTO user);
        Task<User> GetUserById(int id);
        string HashPassword(User user, string password);
        bool VerifyPassword(User user, string password, string hashedPassword);
    }
}
