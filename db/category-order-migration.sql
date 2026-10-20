-- ============================================================================
-- Category Order feature — run this once against the live SQL Server DB.
-- Creates EcomtblCategoryOrder + SP_EcomtblCategoryOrdering, then seeds the initial
-- order from the "Re-Organize & Correction" PDF, sections 2(a)/2(b)/2(c).
--
-- Brand column: 'Main Site' = general/fallback order used site-wide (mobile
-- menu, /men, /women). 'Vidjar' | 'PureNorth' | 'Mingle' | 'Avasaa' = brand-
-- specific override, only used on that brand's /brands/<brand>/men|women page.
-- A product type with no brand-specific row falls back to the Main Site order.
--
-- Safe to re-run: table/column creation is guarded, seeding is MERGE-based.
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'EcomtblCategoryOrder')
BEGIN
    CREATE TABLE EcomtblCategoryOrder (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Brand NVARCHAR(30) NOT NULL DEFAULT 'Main Site',
        Gender NVARCHAR(10) NOT NULL,       -- 'Men' or 'Women'
        ProductType NVARCHAR(100) NOT NULL,
        SortOrder INT NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        EntryDate DATETIME NOT NULL DEFAULT GETDATE(),
        UpdateDate DATETIME NULL,
        CONSTRAINT UQ_EcomtblCategoryOrder_Brand_Gender_ProductType UNIQUE (Brand, Gender, ProductType)
    );
END
ELSE IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('EcomtblCategoryOrder') AND name = 'Brand')
BEGIN
    -- Upgrading a table created before the Brand column existed.
    ALTER TABLE EcomtblCategoryOrder ADD Brand NVARCHAR(30) NOT NULL DEFAULT 'Main Site';

    -- Drop the old (Gender, ProductType) unique constraint if present, replace with (Brand, Gender, ProductType).
    DECLARE @oldConstraint NVARCHAR(200);
    SELECT @oldConstraint = name FROM sys.key_constraints
        WHERE parent_object_id = OBJECT_ID('EcomtblCategoryOrder') AND type = 'UQ';
    IF @oldConstraint IS NOT NULL
        EXEC('ALTER TABLE EcomtblCategoryOrder DROP CONSTRAINT ' + @oldConstraint);

    ALTER TABLE EcomtblCategoryOrder
        ADD CONSTRAINT UQ_EcomtblCategoryOrder_Brand_Gender_ProductType UNIQUE (Brand, Gender, ProductType);
END
GO

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'SP_EcomtblCategoryOrdering')
    DROP PROCEDURE SP_EcomtblCategoryOrdering;
GO

-- QueryChecker:
--   1 = list all active rows (every brand, both genders), ordered by Brand, Gender, SortOrder
--   2 = upsert one row (@Brand, @Gender, @ProductType, @SortOrder) — insert if new, else update SortOrder
CREATE PROCEDURE SP_EcomtblCategoryOrdering
    @QueryChecker INT,
    @Brand NVARCHAR(30) = 'Main Site',
    @Gender NVARCHAR(10) = NULL,
    @ProductType NVARCHAR(100) = NULL,
    @SortOrder INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @QueryChecker = 1
    BEGIN
        SELECT Id, Brand, Gender, ProductType, SortOrder
        FROM EcomtblCategoryOrder
        WHERE IsActive = 1
        ORDER BY Brand, Gender, SortOrder;
    END

    IF @QueryChecker = 2
    BEGIN
        MERGE EcomtblCategoryOrder AS target
        USING (SELECT @Brand AS Brand, @Gender AS Gender, @ProductType AS ProductType) AS src
            ON target.Brand = src.Brand AND target.Gender = src.Gender AND target.ProductType = src.ProductType
        WHEN MATCHED THEN
            UPDATE SET SortOrder = @SortOrder, UpdateDate = GETDATE(), IsActive = 1
        WHEN NOT MATCHED THEN
            INSERT (Brand, Gender, ProductType, SortOrder, IsActive, EntryDate)
            VALUES (@Brand, @Gender, @ProductType, @SortOrder, 1, GETDATE());

        SELECT @@ROWCOUNT AS AffectedRows;
    END
END
GO

-- ============================================================================
-- Seed data — PDF section 2(a) "Trending Categories" (Main Site, both genders).
-- ============================================================================

EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Shirt',      @SortOrder = 0;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Kurti',      @SortOrder = 1;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Tunic',      @SortOrder = 2;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Two-piece',  @SortOrder = 3;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Suit/SKD',   @SortOrder = 4;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Palazzo',    @SortOrder = 5;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Pajama',     @SortOrder = 6;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Jeans',      @SortOrder = 7;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Tank',       @SortOrder = 8;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'T-Shirt',    @SortOrder = 9;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Polo',       @SortOrder = 10;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Trouser',    @SortOrder = 11;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Women', @ProductType = 'Co-Ords',    @SortOrder = 12;

EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Men', @ProductType = 'T-Shirt', @SortOrder = 0;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Men', @ProductType = 'Polo',    @SortOrder = 1;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Men', @ProductType = 'Shirt',   @SortOrder = 2;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Men', @ProductType = 'Panjabi', @SortOrder = 3;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Men', @ProductType = 'Shorts',  @SortOrder = 4;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Men', @ProductType = 'Jeans',   @SortOrder = 5;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Men', @ProductType = 'Pant',    @SortOrder = 6;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Men', @ProductType = 'Trouser', @SortOrder = 7;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Main Site', @Gender = 'Men', @ProductType = 'Co-Ords', @SortOrder = 8;

-- ============================================================================
-- Seed data — PDF section 2(b) Vidjar.
-- ============================================================================

EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Vidjar', @Gender = 'Women', @ProductType = 'Polo',    @SortOrder = 0;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Vidjar', @Gender = 'Women', @ProductType = 'Shirt',   @SortOrder = 1;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Vidjar', @Gender = 'Women', @ProductType = 'Jeans',   @SortOrder = 2;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Vidjar', @Gender = 'Women', @ProductType = 'Trouser', @SortOrder = 3;

EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Vidjar', @Gender = 'Men', @ProductType = 'Polo',    @SortOrder = 0;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Vidjar', @Gender = 'Men', @ProductType = 'Shirt',   @SortOrder = 1;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Vidjar', @Gender = 'Men', @ProductType = 'Panjabi', @SortOrder = 2;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Vidjar', @Gender = 'Men', @ProductType = 'Jeans',   @SortOrder = 3;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'Vidjar', @Gender = 'Men', @ProductType = 'Trouser', @SortOrder = 4;

-- ============================================================================
-- Seed data — PDF section 2(c) Pure North (Ladies only specified).
-- ============================================================================

EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'PureNorth', @Gender = 'Women', @ProductType = 'Tank',    @SortOrder = 0;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'PureNorth', @Gender = 'Women', @ProductType = 'T-Shirt', @SortOrder = 1;
EXEC SP_EcomtblCategoryOrdering @QueryChecker = 2, @Brand = 'PureNorth', @Gender = 'Women', @ProductType = 'Trouser', @SortOrder = 2;
GO
