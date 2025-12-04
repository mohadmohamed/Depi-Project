using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace DEPI.Application.DTOs
{
    public class UploadResumeDTO
    {
        [Required(ErrorMessage = "User ID is required")]
        [Range(1, int.MaxValue, ErrorMessage = "User ID must be a positive number")]
        public int userId { get; set; }

        [Required(ErrorMessage = "File is required")]
        public IFormFile file { get; set; } = null!;
    }
}
