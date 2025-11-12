using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DEPI.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class schemeEdit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Add the UserId column without foreign key constraint
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "ResumeAnalyses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Step 2: Update the UserId column with actual user IDs from the Resume relationship
            migrationBuilder.Sql(@"
                UPDATE ra 
                SET ra.UserId = r.UserId
                FROM ResumeAnalyses ra
                INNER JOIN Resumes r ON ra.ResumeId = r.Id
            ");

            // Step 3: Create the index
            migrationBuilder.CreateIndex(
                name: "IX_ResumeAnalyses_UserId",
                table: "ResumeAnalyses",
                column: "UserId");

            // Step 4: Add the foreign key constraint (now that all UserId values are valid)
            migrationBuilder.AddForeignKey(
                name: "FK_ResumeAnalyses_Users_UserId",
                table: "ResumeAnalyses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ResumeAnalyses_Users_UserId",
                table: "ResumeAnalyses");

            migrationBuilder.DropIndex(
                name: "IX_ResumeAnalyses_UserId",
                table: "ResumeAnalyses");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "ResumeAnalyses");
        }
    }
}
