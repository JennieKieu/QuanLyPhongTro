using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyPhongTro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDepositRefundFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DepositRefundNotes",
                table: "Contracts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DepositRefundedAmount",
                table: "Contracts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "DepositRefundedAt",
                table: "Contracts",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DepositRefundNotes",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "DepositRefundedAmount",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "DepositRefundedAt",
                table: "Contracts");
        }
    }
}
