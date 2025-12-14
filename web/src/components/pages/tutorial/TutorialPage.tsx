"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  User,
  Users,
  FileText,
  Settings,
  Home,
  Lock,
} from "lucide-react";

// Define the image type
type TutorialImage = {
  src: string;
  alt: string;
  description: string;
};

// Define the step type
type TutorialStep = {
  title: string;
  description: string;
  images: TutorialImage[];
};

// Define the category type
type TutorialCategory = {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  steps: TutorialStep[];
};

const TutorialPage = () => {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([0]); // Initially expand the first step
  const [activeCategory, setActiveCategory] = useState<string>("general");

  // In a real application, you would get user permissions from context or state
  // For now, using a mock permission system
  const userPermissions = ["general", "profile", "userManagement"]; // Mock permissions

  // Ensure initial active category is one the user has access to
  useEffect(() => {
    if (!userPermissions.includes(activeCategory)) {
      const firstAccessibleCategory = userPermissions[0];
      if (firstAccessibleCategory) {
        setActiveCategory(firstAccessibleCategory);
      }
    }
  }, [activeCategory, userPermissions]);

  const toggleStep = (stepIndex: number) => {
    if (expandedSteps.includes(stepIndex)) {
      setExpandedSteps(expandedSteps.filter((index) => index !== stepIndex));
    } else {
      setExpandedSteps([...expandedSteps, stepIndex]);
    }
  };

  // Organize tutorials by category
  const tutorialCategories: Record<string, TutorialCategory> = {
    general: {
      title: "آموزش‌های عمومی",
      icon: Home,
      steps: [
        {
          title: "ورود به سیستم",
          description:
            "برای وارد شدن به پنل نامه های خود مراحل زیر را به ترتیب پیش بگیرید",
          images: [
            {
              src: "/images/help/login.png", // Placeholder path for static image
              alt: "فرم ورود به سیستم",
              description: "در این قسمت شماره تماس خود را وارد کنید",
            },
            {
              src: "/images/help/otp.png", // Additional image for this step
              alt: "تایید هویت دو مرحله‌ای",
              description: "کد ارسال شده به شماره تماس وارد شده را وارد کنید",
            },
          ],
        },
        {
          title: "داشبورد کاربری",
          description:
            "پس از ورود موفق، وارد داشبورد کاربری خواهید شد. این صفحه شامل اطلاعات کلی و لینک‌های سریع به بخش‌های مختلف سیستم است.",
          images: [
            {
              src: "/images/tutorial/dashboard.png",
              alt: "داشبورد کاربری",
              description: "نمای کلی داشبورد کاربری پس از ورود موفق",
            },
          ],
        },
        {
          title: "جستجو و فیلتر",
          description:
            "در صفحات لیست، می‌توانید با استفاده از فیلترها و کادر جستجو، اطلاعات مورد نظر خود را پیدا کنید.",
          images: [
            {
              src: "/images/tutorial/search-filters.png",
              alt: "فیلترهای جستجو",
              description: "انواع فیلترهای موجود برای جستجوی اطلاعات",
            },
            {
              src: "/images/tutorial/search-results.png",
              alt: "نتایج جستجو",
              description: "نمایش نتایج جستجو با فیلترهای اعمال شده",
            },
          ],
        },
      ],
    },
    profile: {
      title: "پروفایل کاربری",
      icon: User,
      steps: [
        {
          title: "مشاهده پروفایل",
          description:
            "برای مشاهده پروفایل خود، روی منوی کاربری در گوشه بالا سمت راست کلیک کنید و گزینه پروفایل را انتخاب کنید.",
          images: [
            {
              src: "/images/tutorial/profile-menu.png",
              alt: "منوی پروفایل کاربر",
              description: "محل دسترسی به منوی پروفایل کاربر",
            },
            {
              src: "/images/tutorial/profile-view.png",
              alt: "نمای کلی پروفایل",
              description: "اطلاعات پایه نمایش داده شده در پروفایل کاربر",
            },
          ],
        },
        {
          title: "ویرایش پروفایل",
          description:
            "برای ویرایش اطلاعات پروفایل، پس از ورود به صفحه پروفایل، دکمه ویرایش را کلیک کنید. فیلدهای الزامی با علامت * مشخص شده‌اند.",
          images: [
            {
              src: "/images/tutorial/profile-edit.png",
              alt: "فرم ویرایش پروفایل",
              description: "فرم ویرایش اطلاعات پروفایل کاربر",
            },
            {
              src: "/images/tutorial/profile-required-fields.png",
              alt: "فیلدهای الزامی در پروفایل",
              description: "فیلدهای اجباری که با علامت * مشخص شده‌اند",
            },
          ],
        },
      ],
    },
    userManagement: {
      title: "مدیریت کاربران",
      icon: Users,
      steps: [
        {
          title: "مشاهده لیست کاربران",
          description:
            "برای مشاهده لیست کاربران، از منوی سمت چپ گزینه کاربران را انتخاب کنید. در این صفحه می‌توانید کاربران را مشاهده، ویرایش و حذف کنید.",
          images: [
            {
              src: "/images/tutorial/users-list.png",
              alt: "لیست کاربران",
              description: "نمای کلی لیست کاربران موجود در سیستم",
            },
          ],
        },
        {
          title: "ثبت کاربر جدید",
          description:
            "برای ثبت کاربر جدید، روی دکمه افزودن کاربر جدید کلیک کنید. تمام فیلدهای اجباری باید تکمیل شوند.",
          images: [
            {
              src: "/images/tutorial/new-user-form.png",
              alt: "فرم ثبت کاربر جدید",
              description: "فرم مورد نیاز برای ثبت کاربر جدید",
            },
            {
              src: "/images/tutorial/user-form-fields.png",
              alt: "فیلدهای فرم کاربر",
              description: "توضیحات مربوط به هر یک از فیلدهای فرم کاربر جدید",
            },
          ],
        },
        {
          title: "ویرایش اطلاعات کاربر",
          description:
            "برای ویرایش اطلاعات یک کاربر، روی دکمه ویرایش کاربر مورد نظر کلیک کرده و تغییرات مورد نظر را اعمال کنید.",
          images: [
            {
              src: "/images/tutorial/user-edit-modal.png",
              alt: "مودال ویرایش کاربر",
              description: "مودال نمایش داده شده برای ویرایش اطلاعات کاربر",
            },
            {
              src: "/images/tutorial/user-update-fields.png",
              alt: "فیلدهای بروزرسانی کاربر",
              description: "فیلدهای موجود در فرم بروزرسانی اطلاعات کاربر",
            },
          ],
        },
      ],
    },
    documents: {
      title: "مدیریت اسناد",
      icon: FileText,
      steps: [
        {
          title: "ثبت سند جدید",
          description:
            "برای ثبت سند جدید، از منوی سمت چپ گزینه اسناد را انتخاب کنید و سپس دکمه افزودن سند جدید را کلیک کنید.",
          images: [
            {
              src: "/images/tutorial/documents-form.png",
              alt: "فرم ثبت سند جدید",
              description: "فرم مورد نیاز برای ثبت یک سند جدید",
            },
            {
              src: "/images/tutorial/document-required-fields.png",
              alt: "فیلدهای الزامی سند",
              description: "فیلدهای اجباری در فرم ثبت سند که باید تکمیل شوند",
            },
          ],
        },
        {
          title: "جستجو در اسناد",
          description:
            "می‌توانید اسناد را بر اساس انواع فیلترهای موجود جستجو کنید تا به سرعت سند مورد نظر خود را پیدا کنید.",
          images: [
            {
              src: "/images/tutorial/documents-search.png",
              alt: "جستجوی اسناد",
              description: "ابزارهای جستجو و فیلتر در صفحه اسناد",
            },
            {
              src: "/images/tutorial/documents-search-results.png",
              alt: "نتایج جستجوی اسناد",
              description: "نمایش نتایج جستجوی اسناد",
            },
          ],
        },
      ],
    },
    settings: {
      title: "تنظیمات",
      icon: Settings,
      steps: [
        {
          title: "پیکربندی سیستم",
          description:
            "در بخش تنظیمات می‌توانید پیکربندی‌های مختلف سیستم را مدیریت کنید. دسترسی به این بخش معمولاً برای مدیران سیستم محدود شده است.",
          images: [
            {
              src: "/images/tutorial/settings-menu.png",
              alt: "منوی تنظیمات",
              description: "دسترسی به منوی تنظیمات سیستم",
            },
            {
              src: "/images/tutorial/system-settings.png",
              alt: "تنظیمات سیستم",
              description: "نمای کلی صفحه تنظیمات سیستم",
            },
          ],
        },
      ],
    },
  };

  const categories = Object.entries(tutorialCategories);
  // Only get steps for categories the user has access to
  const currentCategorySteps = userPermissions.includes(activeCategory)
    ? tutorialCategories[activeCategory as keyof typeof tutorialCategories]
        ?.steps || []
    : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl rtl">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          آموزش گام به گام نرم‌افزار
        </h1>
        <p className="text-xl text-purple-200 max-w-3xl mx-auto">
          در این بخش آموزش کامل استفاده از نرم‌افزار را به صورت گام به گام
          مشاهده خواهید کرد
        </p>
      </header>

      {/* Category Navigation */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories
            .filter(([key]) => userPermissions.includes(key)) // Only show categories user has access to
            .map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeCategory === key
                      ? "bg-purple-600 text-white"
                      : "bg-slate-700/50 text-gray-200 hover:bg-slate-600/50"
                  }`}
                >
                  <IconComponent size={20} />
                  <span>{category.title}</span>
                </button>
              );
            })}
          {/* Show locked categories if user doesn't have access */}
          {categories
            .filter(([key]) => !userPermissions.includes(key))
            .map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 text-gray-400 cursor-not-allowed opacity-60"
                  title="شما دسترسی لازم برای مشاهده این بخش را ندارید"
                >
                  <Lock size={20} />
                  <span>{category.title}</span>
                </div>
              );
            })}
        </div>
      </section>

      {/* Table of Contents for active category */}
      <section className="mb-12 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>
            محتوای{" "}
            {
              tutorialCategories[
                activeCategory as keyof typeof tutorialCategories
              ]?.title
            }
          </span>
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentCategorySteps.map((step, index) => (
            <li
              key={index}
              className="bg-slate-800/50 hover:bg-slate-700/50 transition-colors p-3 rounded-lg cursor-pointer"
              onClick={() => toggleStep(index)}
            >
              <span className="flex items-center gap-2 text-white font-medium">
                <span className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                {step.title}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Tutorial Steps for active category */}
      <section className="space-y-6">
        {currentCategorySteps.map((step, index) => (
          <div
            key={index}
            className={`bg-white/10 backdrop-blur-lg rounded-xl border ${
              expandedSteps.includes(index)
                ? "border-purple-500 shadow-lg shadow-purple-500/20"
                : "border-white/20"
            } transition-all duration-300 overflow-hidden`}
          >
            <button
              className="w-full p-5 flex justify-between items-center text-right"
              onClick={() => toggleStep(index)}
              aria-expanded={expandedSteps.includes(index)}
            >
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center">
                  {index + 1}
                </span>
                {step.title}
              </h2>
              <div className="text-white">
                {expandedSteps.includes(index) ? (
                  <Minus size={24} />
                ) : (
                  <Plus size={24} />
                )}
              </div>
            </button>

            {expandedSteps.includes(index) && (
              <div className="p-5 pt-0 border-t border-white/10">
                <div className="text-gray-200 mb-6 leading-relaxed text-lg prose prose-invert max-w-none">
                  <p className="font-medium">{step.description}</p>
                </div>

                {/* Static Images Section with descriptions */}
                {step.images && step.images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="block text-lg font-medium text-white mb-4">
                      تصاویر مربوط به گام {index + 1}
                    </h3>

                    <div className="flex flex-col items-center">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        {step.images.map((image, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="border border-white/20 rounded-lg overflow-hidden bg-slate-800/30 p-2 flex flex-col items-center"
                          >
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-auto rounded object-contain max-h-80"
                            />
                            <p className="text-sm text-gray-300 mt-2 text-center">
                              تصویر {imgIndex + 1}
                            </p>
                            <p className="text-sm text-gray-200 mt-2 text-center px-2 py-1">
                              {image.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Additional Resources */}
      <footer className="mt-16 text-center text-gray-300">
        <p className="mb-4">
          اگر سوالی دارید یا نیاز به اطلاعات بیشتری دارید، با پشتیبانی تماس
          بگیرید.
        </p>
        <div className="inline-flex gap-4">
          <button className="px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors">
            تماس با پشتیبانی
          </button>
          <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            مشاهده ویدئوهای آموزشی
          </button>
        </div>
      </footer>
    </div>
  );
};

export default TutorialPage;
