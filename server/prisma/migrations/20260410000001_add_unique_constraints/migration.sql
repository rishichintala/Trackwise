-- CreateIndex: unique constraint for Budget (userId, category, month)
CREATE UNIQUE INDEX "Budget_userId_category_month_key" ON "Budget"("userId", "category", "month");

-- CreateIndex: unique constraint for Income (userId, month)
CREATE UNIQUE INDEX "Income_userId_month_key" ON "Income"("userId", "month");
