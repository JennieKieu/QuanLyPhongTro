using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyPhongTro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTerminationAndRentalTermsAccepted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RentalTermsAcceptedAt",
                table: "Contracts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TerminationInitiatedBy",
                table: "Contracts",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TerminationReason",
                table: "Contracts",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RentalTermsAcceptedAt",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "TerminationInitiatedBy",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "TerminationReason",
                table: "Contracts");
        }
    }
}
