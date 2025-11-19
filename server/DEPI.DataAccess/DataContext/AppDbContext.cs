using DEPI.DataAccess.Entites;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.DataAccess.DataContext
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Resume> Resumes { get; set; }
        public DbSet<ResumeAnalysis> ResumeAnalyses { get; set; }
        public DbSet<InterviewSession> InterviewSessions { get; set; }
        public DbSet<InterviewAnswer> InterviewAnswers { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure relationships to prevent circular cascading delete paths
            
            // Fix Resume -> User relationship
            modelBuilder.Entity<Resume>()
                .HasOne(r => r.User)
                .WithMany(u => u.Resumes)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Fix InterviewSession -> Resume relationship
            modelBuilder.Entity<InterviewSession>()
                .HasOne(s => s.Resume)
                .WithMany()
                .HasForeignKey(s => s.ResumeId)
                .OnDelete(DeleteBehavior.NoAction);
                
            // Fix InterviewSession -> User relationship
            modelBuilder.Entity<InterviewSession>()
                .HasOne(s => s.User)
                .WithMany(u => u.InterviewSessions)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.NoAction);
                
            // Fix InterviewAnswer -> InterviewSession relationship
            modelBuilder.Entity<InterviewAnswer>()
                .HasOne(a => a.InterviewSession)
                .WithMany(s => s.Answers)
                .HasForeignKey(a => a.InterviewSessionId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Fix ResumeAnalysis -> Resume relationship
            modelBuilder.Entity<ResumeAnalysis>()
                .HasOne(ra => ra.Resume)
                .WithOne(r => r.Analysis)
                .HasForeignKey<ResumeAnalysis>(ra => ra.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
